import { fetchRepoMetadata, fetchRepoTree, fetchFileContent, fetchRepoLanguages } from '../services/githubService.js';
import { generateCompletion, generateStructuredAnalysis, chatWithContext, sleep } from '../services/groqService.js';
import { storeDocuments, queryDocuments } from '../services/chromaService.js';

// ═══════════════ CACHING & DEDUP ═══════════════

/**
 * Full analysis result cache — keyed by "owner_repo".
 * Stores the complete response so repeat requests return instantly.
 */
const analysisCache = new Map();

/**
 * Chat context cache — lightweight repo context for the chat feature.
 */
const repoCache = new Map();

/**
 * In-progress tracker — prevents duplicate simultaneous analyses of the same repo.
 * Maps repoName → Promise<result> so concurrent requests await the same work.
 */
const inProgress = new Map();

// ═══════════════ HELPERS ═══════════════

const parseGitHubUrl = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace('.git', '') };
};

/**
 * Detects if an error is a Groq rate-limit error.
 */
const isRateLimitError = (error) => {
  return (
    error.isRateLimit === true ||
    error.message?.includes('RATE_LIMIT_EXCEEDED') ||
    error.message?.includes('Rate limit') ||
    error.status === 429
  );
};

// ═══════════════ CORE ANALYSIS LOGIC ═══════════════

/**
 * Performs the actual repository analysis work. Isolated so it can be
 * shared by concurrent requests via the inProgress map.
 */
const performAnalysis = async (owner, repo, repoName) => {
  // 1. Fetch metadata & languages in parallel
  const [metadata, languages] = await Promise.all([
    fetchRepoMetadata(owner, repo),
    fetchRepoLanguages(owner, repo).catch(() => ({})),
  ]);

  const branch = metadata.default_branch || 'main';

  // 2. Fetch tree
  const treeData = await fetchRepoTree(owner, repo, branch);
  if (!treeData || !treeData.tree) {
    throw new Error('Could not fetch repository tree.');
  }

  // Filter tree
  const filePaths = treeData.tree
    .filter(
      (item) =>
        item.type === 'blob' &&
        !item.path.includes('node_modules') &&
        !item.path.includes('.git/')
    )
    .map((item) => item.path);

  // Limit tree size for LLM token context
  const treeString = filePaths.slice(0, 150).join('\n');

  // 3. Fetch package.json
  let packageJson = null;
  let numDependencies = 0;
  const pkgContent = await fetchFileContent(owner, repo, 'package.json');
  if (pkgContent) {
    try {
      packageJson = JSON.parse(pkgContent);
      numDependencies =
        Object.keys(packageJson.dependencies || {}).length +
        Object.keys(packageJson.devDependencies || {}).length;
    } catch (e) {}
  }

  // 4. Complexity calculation (no AI needed)
  const numFiles = filePaths.length;
  const folderDepth = Math.max(...filePaths.map((p) => p.split('/').length), 1);
  const totalBytes = treeData.tree.reduce((acc, item) => acc + (item.size || 0), 0);
  const approxLOC = Math.floor(totalBytes / 30);

  let complexityScore = 'Low';
  let timeToUnderstand = 'A few hours';
  if (approxLOC > 10000 || folderDepth > 10 || numDependencies > 30) {
    complexityScore = 'High';
    timeToUnderstand = '2+ weeks';
  } else if (approxLOC > 2000 || folderDepth > 5 || numDependencies > 10) {
    complexityScore = 'Medium';
    timeToUnderstand = 'A few days';
  }

  // 5. AI Analysis — try combined prompt first (1 call instead of 7)
  const pkgString = packageJson
    ? JSON.stringify(packageJson, null, 2).slice(0, 1500)
    : 'No package.json found.';

  let summary, folderExplanation, techStack, dependenciesExplanation, architecture, runInstructions, keyFiles;

  const structured = await generateStructuredAnalysis({
    metadata,
    treeString,
    pkgString,
    repoName,
  });

  if (structured) {
    // Combined prompt succeeded
    ({ summary, folderExplanation, techStack, dependenciesExplanation, architecture, runInstructions, keyFiles } = structured);
  } else {
    // Fallback: individual prompts with throttling (sleep baked into groqService)
    console.log('Using fallback individual prompts...');
    summary = await generateCompletion(
      `Based on this metadata: ${JSON.stringify(metadata)}\nAnd this title and description, summarize the project. Format exactly with these 3 headers and use concise bullet points: '### Project Purpose', '### Key Features', '### Use Cases'.`
    );
    folderExplanation = await generateCompletion(
      `Here is the file structure of a repository:\n${treeString}\nExplain the folder structure and its purpose. Use concise bullet points.`
    );
    techStack = await generateCompletion(
      `Here is the package.json of a project:\n${pkgString}\nDetect the frameworks and libraries used and list the main ones. Return as a Markdown list.`
    );
    dependenciesExplanation = await generateCompletion(
      `Here is the package.json of a project:\n${pkgString}\nExplain the dependencies and their roles in detail. Format exactly as a bulleted list under the header '### Dependencies'.`
    );
    architecture = await generateCompletion(
      `Based on this file structure:\n${treeString}\nAnd this package.json:\n${pkgString}\nGive a high-level system architecture overview. Format exactly as a bulleted list under the header '### Architecture Overview'.`
    );
    runInstructions = await generateCompletion(
      `Based on this package.json:\n${pkgString}\nAnd the repository name ${repoName}, generate instructions for running the project locally. Format exactly as a step-by-step list under the header '### How To Run The Project' (e.g. Clone repository, Install dependencies, Run development server) including bash code blocks where appropriate.`
    );

    const keyFilesResponse = await generateCompletion(
      `Identify the most important files in this repository based on this structure. Output only a comma-separated list of file paths. Do not include any explanations.\n\nStructure:\n${treeString}`
    );
    keyFiles = keyFilesResponse
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
  }

  // 6. Store documents for chat (background, non-blocking)
  const readmeContent = (await fetchFileContent(owner, repo, 'README.md')) || '';

  // Fire-and-forget document storage
  (async () => {
    try {
      const chunks = [];
      const metadatas = [];

      const treeChunkSize = 50;
      for (let i = 0; i < filePaths.length; i += treeChunkSize) {
        const chunkPaths = filePaths.slice(i, i + treeChunkSize).join('\n');
        chunks.push(`File structure part:\n${chunkPaths}`);
        metadatas.push({ source: 'tree' });
      }

      if (readmeContent) {
        chunks.push(`README.md content:\n${readmeContent.slice(0, 2000)}`);
        metadatas.push({ source: 'readme' });
      }

      if (chunks.length > 0) {
        await storeDocuments(repoName, chunks, metadatas);
      }
    } catch (e) {
      console.warn('Background document storage failed:', e.message);
    }
  })();

  // Store lightweight context for chat
  repoCache.set(repoName, {
    name: metadata.name,
    description: metadata.description,
    readme: readmeContent.slice(0, 1500),
    dependencies: pkgString,
    folderStructure: treeString,
    importantFiles: keyFiles.join(', '),
  });

  // Build response
  const result = {
    metadata: {
      name: metadata.name,
      owner: metadata.owner?.login || owner,
      avatarUrl: metadata.owner?.avatar_url,
      description: metadata.description,
      stars: metadata.stargazers_count,
      forks: metadata.forks_count,
      openIssues: metadata.open_issues_count,
      defaultBranch: branch,
      lastUpdated: metadata.updated_at,
      url: metadata.html_url,
    },
    languages,
    summary,
    folderExplanation,
    techStack,
    dependenciesExplanation,
    architecture,
    runInstructions,
    keyFiles,
    complexity: {
      score: complexityScore,
      estimatedTime: timeToUnderstand,
      numFiles,
      numDependencies,
      folderDepth,
      approxLOC,
    },
    tree: treeData.tree,
    repoId: repoName,
    cached: false,
  };

  return result;
};

// ═══════════════ ROUTE HANDLERS ═══════════════

export const analyzeRepository = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'GitHub URL is required.' });

  const parsed = parseGitHubUrl(url);
  if (!parsed) return res.status(400).json({ error: 'Invalid GitHub URL.' });

  const { owner, repo } = parsed;
  const repoName = `${owner}_${repo}`;

  try {
    // ── CHECK CACHE ──
    if (analysisCache.has(repoName)) {
      console.log(`✅ Cache hit for ${repoName}`);
      const cached = analysisCache.get(repoName);
      return res.json({ ...cached, cached: true });
    }

    // ── CHECK IN-PROGRESS (prevent duplicate simultaneous analyses) ──
    if (inProgress.has(repoName)) {
      console.log(`⏳ Analysis already in progress for ${repoName}, awaiting result...`);
      const result = await inProgress.get(repoName);
      return res.json({ ...result, cached: true });
    }

    // ── START ANALYSIS ──
    console.log(`🔍 Starting fresh analysis for ${repoName}...`);

    const analysisPromise = performAnalysis(owner, repo, repoName);
    inProgress.set(repoName, analysisPromise);

    try {
      const result = await analysisPromise;

      // Store in cache
      analysisCache.set(repoName, result);
      console.log(`💾 Cached analysis for ${repoName}`);

      return res.json(result);
    } finally {
      // Always clean up in-progress tracker
      inProgress.delete(repoName);
    }
  } catch (error) {
    console.error('Analyze Error:', error.message);

    // Return a specific error type for rate limits
    if (isRateLimitError(error)) {
      return res.status(429).json({
        error: 'AI analysis is temporarily busy due to rate limiting. Please try again in a few seconds.',
        errorType: 'RATE_LIMIT',
      });
    }

    const msg = error.response ? error.response.data.message : error.message;
    res.status(500).json({ error: `Failed to analyze repository: ${msg}` });
  }
};

export const chatWithRepository = async (req, res) => {
  const { repoId, message } = req.body;
  if (!repoId || !message) {
    return res.status(400).json({ error: 'repoId and message are required.' });
  }

  try {
    const contextDoc = await queryDocuments(repoId, message, 3);
    const vectorContext = Array.isArray(contextDoc) ? contextDoc.join('\n\n') : '';

    const cached = repoCache.get(repoId) || {};

    const context = `
Repository Name: ${cached.name || repoId}
Description: ${cached.description || 'N/A'}

README:
${cached.readme || 'N/A'}

Dependencies:
${cached.dependencies || 'N/A'}

Folder Structure:
${cached.folderStructure || 'N/A'}

Important Files:
${cached.importantFiles || 'N/A'}

Relevant Context from Vector DB:
${vectorContext}
`;

    const answer = await chatWithContext(message, context);
    res.json({ reply: answer });
  } catch (error) {
    console.error('Chat Error:', error);

    if (isRateLimitError(error)) {
      return res.status(429).json({
        error: 'AI chat is temporarily busy due to rate limiting. Please try again in a few seconds.',
        errorType: 'RATE_LIMIT',
      });
    }

    res.status(500).json({ error: 'Failed to chat with repository.' });
  }
};

export const explainFile = async (req, res) => {
  const { url, filePath } = req.body;
  if (!url || !filePath) return res.status(400).json({ error: 'URL and filePath are required' });

  const parsed = parseGitHubUrl(url);
  if (!parsed) return res.status(400).json({ error: 'Invalid GitHub URL.' });

  const { owner, repo } = parsed;

  try {
    const fileContent = await fetchFileContent(owner, repo, filePath);
    if (!fileContent) {
      return res.status(404).json({ error: 'File content not found or empty.' });
    }

    const explanation = await generateCompletion(
      `Explain this file:\n\nFileName: ${filePath}\n\nContent:\n${String(fileContent).slice(0, 3000)}\n\nUse bullet points and be concise. Structure with "### Purpose" and "### Key Logic".`
    );

    res.json({ explanation });
  } catch (error) {
    console.error('File Explain Error:', error);

    if (isRateLimitError(error)) {
      return res.status(429).json({
        error: 'AI analysis is temporarily busy due to rate limiting. Please try again in a few seconds.',
        errorType: 'RATE_LIMIT',
      });
    }

    res.status(500).json({ error: 'Failed to explain file.' });
  }
};

/**
 * Utility endpoint: clear the analysis cache for a specific repo or all repos.
 */
export const clearCache = (req, res) => {
  const { repoId } = req.body;
  if (repoId) {
    analysisCache.delete(repoId);
    repoCache.delete(repoId);
    res.json({ message: `Cache cleared for ${repoId}` });
  } else {
    analysisCache.clear();
    repoCache.clear();
    res.json({ message: 'All caches cleared' });
  }
};
