/**
 * dependencyDetector.js — Multi-ecosystem dependency detection.
 *
 * Detects dependencies from ecosystem-specific files across:
 * Node, Python, Rust, Go, Java, C#, Ruby
 *
 * Also performs fallback framework detection from code imports
 * when no dependency files are found.
 */

import { fetchFileContent } from './githubService.js';

// ═══════════════ ECOSYSTEM DEFINITIONS ═══════════════

/**
 * Each ecosystem definition maps a manifest file to a parser function.
 * The parser receives the raw file content and returns:
 *   { ecosystem, file, dependencies: string[], devDependencies: string[], raw: string }
 */
const ECOSYSTEMS = [
  {
    name: 'Node.js',
    file: 'package.json',
    parse: (content) => {
      try {
        const pkg = JSON.parse(content);
        return {
          ecosystem: 'Node.js',
          file: 'package.json',
          dependencies: Object.keys(pkg.dependencies || {}),
          devDependencies: Object.keys(pkg.devDependencies || {}),
          raw: content,
        };
      } catch { return null; }
    },
  },
  {
    name: 'Python',
    file: 'requirements.txt',
    parse: (content) => {
      const deps = content
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#') && !l.startsWith('-'))
        .map((l) => l.split(/[=<>!~;@\s]/)[0].trim())
        .filter(Boolean);
      return {
        ecosystem: 'Python',
        file: 'requirements.txt',
        dependencies: deps,
        devDependencies: [],
        raw: content,
      };
    },
  },
  {
    name: 'Python',
    file: 'pyproject.toml',
    parse: (content) => {
      // Simple TOML parsing for dependencies array
      const deps = [];
      const depMatch = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
      if (depMatch) {
        const items = depMatch[1].match(/"([^"]+)"/g) || [];
        items.forEach((item) => {
          deps.push(item.replace(/"/g, '').split(/[=<>!~;@\s]/)[0].trim());
        });
      }
      return {
        ecosystem: 'Python',
        file: 'pyproject.toml',
        dependencies: deps,
        devDependencies: [],
        raw: content,
      };
    },
  },
  {
    name: 'Rust',
    file: 'Cargo.toml',
    parse: (content) => {
      // Extract [dependencies] section
      const deps = [];
      const depSection = content.match(/\[dependencies\]([\s\S]*?)(\[|$)/);
      if (depSection) {
        const lines = depSection[1].split('\n');
        lines.forEach((line) => {
          const m = line.match(/^(\S+)\s*=/);
          if (m) deps.push(m[1].trim());
        });
      }
      return {
        ecosystem: 'Rust',
        file: 'Cargo.toml',
        dependencies: deps,
        devDependencies: [],
        raw: content,
      };
    },
  },
  {
    name: 'Go',
    file: 'go.mod',
    parse: (content) => {
      const deps = [];
      const requireBlock = content.match(/require\s*\(([\s\S]*?)\)/);
      if (requireBlock) {
        requireBlock[1].split('\n').forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('//')) {
            const parts = trimmed.split(/\s+/);
            if (parts[0]) deps.push(parts[0]);
          }
        });
      }
      // Single-line requires
      const singleReqs = content.matchAll(/require\s+(\S+)\s+/g);
      for (const m of singleReqs) {
        if (m[1] && !m[1].startsWith('(')) deps.push(m[1]);
      }
      return {
        ecosystem: 'Go',
        file: 'go.mod',
        dependencies: [...new Set(deps)],
        devDependencies: [],
        raw: content,
      };
    },
  },
  {
    name: 'Java',
    file: 'pom.xml',
    parse: (content) => {
      const deps = [];
      const depMatches = content.matchAll(/<dependency>[\s\S]*?<groupId>(.*?)<\/groupId>[\s\S]*?<artifactId>(.*?)<\/artifactId>[\s\S]*?<\/dependency>/g);
      for (const m of depMatches) {
        deps.push(`${m[1]}:${m[2]}`);
      }
      return {
        ecosystem: 'Java',
        file: 'pom.xml',
        dependencies: deps,
        devDependencies: [],
        raw: content,
      };
    },
  },
  {
    name: 'C#',
    files: ['.csproj'],  // special: look for any .csproj file in tree
    filePattern: /\.csproj$/i,
    parse: (content, fileName) => {
      const deps = [];
      const pkgRefs = content.matchAll(/<PackageReference\s+Include="([^"]+)"/gi);
      for (const m of pkgRefs) {
        deps.push(m[1]);
      }
      return {
        ecosystem: 'C#',
        file: fileName || '.csproj',
        dependencies: deps,
        devDependencies: [],
        raw: content,
      };
    },
  },
  {
    name: 'Ruby',
    file: 'Gemfile',
    parse: (content) => {
      const deps = [];
      const gemMatches = content.matchAll(/gem\s+['"](\S+?)['"]/g);
      for (const m of gemMatches) {
        deps.push(m[1]);
      }
      return {
        ecosystem: 'Ruby',
        file: 'Gemfile',
        dependencies: deps,
        devDependencies: [],
        raw: content,
      };
    },
  },
];

// ═══════════════ FRAMEWORK HEURISTICS ═══════════════

/**
 * Import-based framework detection patterns.
 * Scanned when no dependency manifest files are found.
 */
const FRAMEWORK_PATTERNS = [
  // JavaScript / TypeScript
  { pattern: /(?:import|require)\s*\(?['"]react/i,                  framework: 'React' },
  { pattern: /(?:import|require)\s*\(?['"]next/i,                   framework: 'Next.js' },
  { pattern: /(?:import|require)\s*\(?['"]express/i,                framework: 'Express' },
  { pattern: /(?:import|require)\s*\(?['"]vue/i,                    framework: 'Vue.js' },
  { pattern: /(?:import|require)\s*\(?['"]@angular/i,               framework: 'Angular' },
  { pattern: /(?:import|require)\s*\(?['"]svelte/i,                 framework: 'Svelte' },
  { pattern: /(?:import|require)\s*\(?['"]fastify/i,                framework: 'Fastify' },
  { pattern: /(?:import|require)\s*\(?['"]koa/i,                    framework: 'Koa' },
  { pattern: /(?:import|require)\s*\(?['"]nestjs|@nestjs/i,         framework: 'NestJS' },
  // Python
  { pattern: /from\s+flask\b/i,                                     framework: 'Flask' },
  { pattern: /from\s+django\b/i,                                    framework: 'Django' },
  { pattern: /from\s+fastapi\b|import\s+fastapi/i,                  framework: 'FastAPI' },
  { pattern: /import\s+tornado/i,                                    framework: 'Tornado' },
  { pattern: /import\s+streamlit/i,                                  framework: 'Streamlit' },
  { pattern: /import\s+tensorflow|from\s+tensorflow/i,               framework: 'TensorFlow' },
  { pattern: /import\s+torch|from\s+torch/i,                         framework: 'PyTorch' },
  // Rust
  { pattern: /use\s+actix_web/i,                                     framework: 'Actix Web' },
  { pattern: /use\s+rocket/i,                                        framework: 'Rocket' },
  { pattern: /use\s+tokio/i,                                         framework: 'Tokio' },
  // Go
  { pattern: /\"github\.com\/gin-gonic\/gin\"/i,                     framework: 'Gin' },
  { pattern: /\"github\.com\/labstack\/echo\"/i,                     framework: 'Echo' },
  { pattern: /\"github\.com\/gofiber\/fiber\"/i,                     framework: 'Fiber' },
  // Java
  { pattern: /import\s+org\.springframework/i,                       framework: 'Spring' },
  { pattern: /import\s+javax\.servlet/i,                             framework: 'Java Servlets' },
];

// ═══════════════ PUBLIC API ═══════════════

/**
 * Detect dependencies across all supported ecosystems.
 *
 * @param {string} owner - GitHub repo owner
 * @param {string} repo - GitHub repo name
 * @param {string[]} filePaths - All file paths from the tree (for .csproj discovery)
 * @returns {{ ecosystems: object[], totalDeps: number, depString: string }}
 */
export const detectDependencies = async (owner, repo, filePaths = []) => {
  const results = [];

  for (const eco of ECOSYSTEMS) {
    try {
      // Special case: C# — find first .csproj in tree
      if (eco.filePattern) {
        const csprojFile = filePaths.find((f) => eco.filePattern.test(f));
        if (csprojFile) {
          const content = await fetchFileContent(owner, repo, csprojFile);
          if (content) {
            const parsed = eco.parse(String(content), csprojFile);
            if (parsed && (parsed.dependencies.length > 0 || parsed.devDependencies.length > 0)) {
              results.push(parsed);
            }
          }
        }
        continue;
      }

      const content = await fetchFileContent(owner, repo, eco.file);
      if (content) {
        const parsed = eco.parse(String(content));
        if (parsed && (parsed.dependencies.length > 0 || parsed.devDependencies.length > 0)) {
          results.push(parsed);
        }
      }
    } catch (e) {
      // Silently skip ecosystems that fail
    }
  }

  // Calculate totals
  const totalDeps = results.reduce(
    (sum, r) => sum + r.dependencies.length + r.devDependencies.length,
    0
  );

  // Build a combined dependency string for AI prompts
  const depString = results.length > 0
    ? results
        .map((r) => {
          const deps = r.dependencies.length > 0
            ? `Dependencies: ${r.dependencies.slice(0, 30).join(', ')}`
            : '';
          const devDeps = r.devDependencies.length > 0
            ? `Dev: ${r.devDependencies.slice(0, 15).join(', ')}`
            : '';
          return `[${r.ecosystem} — ${r.file}]\n${deps}${devDeps ? '\n' + devDeps : ''}`;
        })
        .join('\n\n')
    : 'No dependency files found.';

  return { ecosystems: results, totalDeps, depString };
};

/**
 * Detect frameworks from code imports when no dependency files exist.
 * Scans a sample of source files for import patterns.
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string[]} filePaths
 * @returns {string[]} Detected framework names.
 */
export const detectFrameworksFromImports = async (owner, repo, filePaths) => {
  const codeExtensions = /\.(js|ts|tsx|jsx|py|go|rs|java|rb|cs)$/i;
  const sourceFiles = filePaths
    .filter((f) => codeExtensions.test(f))
    .slice(0, 8); // sample up to 8 files

  const detected = new Set();

  for (const file of sourceFiles) {
    try {
      const content = await fetchFileContent(owner, repo, file);
      if (!content) continue;
      const text = String(content).slice(0, 3000); // only scan first 3KB

      for (const { pattern, framework } of FRAMEWORK_PATTERNS) {
        if (pattern.test(text)) {
          detected.add(framework);
        }
      }
    } catch {
      // skip
    }
  }

  return [...detected];
};
