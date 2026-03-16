/**
 * fileScoring.js — Score-based important file detection.
 *
 * Assigns a numeric score to every file in the repo tree,
 * deduplicates paths, and returns only the top N most important files.
 */

// ═══════════════ SCORING RULES ═══════════════

/**
 * Exact filename matches (case-insensitive).
 */
const EXACT_SCORES = {
  'readme.md':          100,
  'readme.txt':         100,
  'readme':             100,
  'package.json':       95,
  'requirements.txt':   90,
  'pyproject.toml':     90,
  'cargo.toml':         88,
  'go.mod':             88,
  'pom.xml':            88,
  'build.gradle':       85,
  '.csproj':            85,  // matched via extension below
  'gemfile':            85,
  'setup.py':           85,
  'setup.cfg':          82,
  'dockerfile':         80,
  'docker-compose.yml': 78,
  'docker-compose.yaml':78,
  'makefile':           75,
  '.env':               70,
  '.env.example':       68,
  '.gitignore':         50,
  'license':            45,
  'license.md':         45,
  'changelog.md':       40,
  'contributing.md':    38,
};

/**
 * Scores awarded for matching partial patterns in the filename.
 */
const NAME_PATTERN_SCORES = [
  // Main / index entry points
  { pattern: /^(index|main)\.(js|ts|tsx|jsx|py|go|rs|java|rb)$/i, score: 20 },
  // App entry points
  { pattern: /^app\.(js|ts|tsx|jsx|py)$/i, score: 18 },
  // Server entry points
  { pattern: /^server\.(js|ts|py)$/i, score: 18 },
  // Config files
  { pattern: /config\.(js|ts|mjs|cjs|json|yaml|yml|toml)$/i, score: 25 },
  { pattern: /^tsconfig.*\.json$/i, score: 25 },
  { pattern: /^\.eslintrc/i, score: 20 },
  { pattern: /^eslint\.config/i, score: 20 },
  { pattern: /^prettier/i, score: 15 },
  { pattern: /^jest\.config/i, score: 15 },
  { pattern: /^babel\.config/i, score: 15 },
  // CI/CD
  { pattern: /^\.github\/workflows\//i, score: 15 },
  // Lock files (low priority)
  { pattern: /lock\.(json|yaml)$/i, score: 5 },
  { pattern: /\.lock$/i, score: 5 },
];

/**
 * Scores awarded when a file lives inside certain directories.
 */
const DIR_PATTERN_SCORES = [
  { pattern: /^src\//i,        score: 30 },
  { pattern: /^core\//i,       score: 30 },
  { pattern: /^lib\//i,        score: 30 },
  { pattern: /^app\//i,        score: 25 },
  { pattern: /^pages\//i,      score: 22 },
  { pattern: /^components\//i,  score: 20 },
  { pattern: /^services\//i,   score: 20 },
  { pattern: /^controllers\//i, score: 20 },
  { pattern: /^routes\//i,     score: 18 },
  { pattern: /^api\//i,        score: 18 },
  { pattern: /^models\//i,     score: 18 },
  { pattern: /^utils\//i,      score: 15 },
  { pattern: /^helpers\//i,    score: 12 },
  { pattern: /^config\//i,     score: 15 },
  { pattern: /^tests?\//i,     score: 8 },
  { pattern: /^__tests__\//i,  score: 8 },
  { pattern: /^docs\//i,       score: 10 },
];

/**
 * Extension-based bonus (for .csproj which is tricky to match by name).
 */
const EXTENSION_SCORES = {
  '.csproj': 85,
  '.sln':    80,
  '.fsproj': 80,
};

// ═══════════════ PUBLIC API ═══════════════

/**
 * Scores a single file path and returns the total score.
 */
export const scoreFile = (filePath) => {
  let score = 0;
  const fileName = (filePath.split('/').pop() || '').toLowerCase();
  const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '';

  // 1. Exact filename match
  if (EXACT_SCORES[fileName] !== undefined) {
    score += EXACT_SCORES[fileName];
  }

  // 2. Extension-based match
  if (ext && EXTENSION_SCORES[ext] !== undefined) {
    score += EXTENSION_SCORES[ext];
  }

  // 3. Name pattern matches
  for (const { pattern, score: s } of NAME_PATTERN_SCORES) {
    if (pattern.test(fileName)) {
      score += s;
      break; // only first match
    }
  }

  // 4. Directory pattern matches (additive — a file in src/core/ gets both bonuses)
  for (const { pattern, score: s } of DIR_PATTERN_SCORES) {
    if (pattern.test(filePath)) {
      score += s;
    }
  }

  return score;
};

/**
 * Ranks all file paths, deduplicates, and returns the top N important files.
 *
 * @param {string[]} filePaths - All file paths from the repo tree.
 * @param {string[]} aiSuggestedFiles - Files suggested by the AI (optional, get a bonus).
 * @param {number} topN - How many files to return (default 10).
 * @returns {{ path: string, score: number }[]} Scored and ranked files.
 */
export const rankImportantFiles = (filePaths, aiSuggestedFiles = [], topN = 10) => {
  // Use a Set to deduplicate
  const uniquePaths = [...new Set(filePaths)];
  const aiSet = new Set(aiSuggestedFiles.map((f) => f.trim().toLowerCase()));

  const scored = uniquePaths.map((path) => {
    let score = scoreFile(path);

    // Bonus if AI also flagged this file
    if (aiSet.has(path.toLowerCase())) {
      score += 10;
    }

    return { path, score };
  });

  // Sort by score descending, then alphabetically as tie-breaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.path.localeCompare(b.path);
  });

  // Return only files with a score > 0, capped at topN
  return scored.filter((f) => f.score > 0).slice(0, topN);
};

/**
 * Returns just the file paths (no scores) for backward compatibility.
 */
export const getTopImportantFiles = (filePaths, aiSuggestedFiles = [], topN = 10) => {
  return rankImportantFiles(filePaths, aiSuggestedFiles, topN).map((f) => f.path);
};
