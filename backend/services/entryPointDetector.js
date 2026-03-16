/**
 * entryPointDetector.js — Detects repository entry points and core modules.
 *
 * Scans the file tree for common entry filenames, ranks them by probability,
 * and identifies core module directories.
 */

// ═══════════════ ENTRY POINT PATTERNS ═══════════════

/**
 * Entry point candidates ranked by priority (highest first).
 * Each entry: { pattern (regex for full path), label, priority }
 */
const ENTRY_PATTERNS = [
  // Root-level entry points (highest priority)
  { pattern: /^src\/index\.(ts|tsx|js|jsx)$/i,     label: 'src/index',     priority: 100 },
  { pattern: /^src\/main\.(ts|tsx|js|jsx)$/i,      label: 'src/main',      priority: 98 },
  { pattern: /^src\/app\.(ts|tsx|js|jsx)$/i,       label: 'src/app',       priority: 95 },
  { pattern: /^index\.(ts|tsx|js|jsx)$/i,          label: 'index',         priority: 90 },
  { pattern: /^main\.(ts|tsx|js|jsx|py|go|rs)$/i,  label: 'main',          priority: 88 },
  { pattern: /^app\.(ts|tsx|js|jsx|py)$/i,         label: 'app',           priority: 85 },
  { pattern: /^server\.(ts|js)$/i,                 label: 'server',        priority: 82 },
  // Python
  { pattern: /^main\.py$/i,                        label: 'main.py',       priority: 88 },
  { pattern: /^app\.py$/i,                         label: 'app.py',        priority: 85 },
  { pattern: /^manage\.py$/i,                      label: 'manage.py',     priority: 80 },
  { pattern: /^wsgi\.py$/i,                        label: 'wsgi.py',       priority: 75 },
  { pattern: /^asgi\.py$/i,                        label: 'asgi.py',       priority: 75 },
  // Go
  { pattern: /^cmd\/.*\/main\.go$/i,               label: 'cmd/main.go',   priority: 85 },
  { pattern: /^main\.go$/i,                        label: 'main.go',       priority: 88 },
  // Rust
  { pattern: /^src\/main\.rs$/i,                   label: 'src/main.rs',   priority: 95 },
  { pattern: /^src\/lib\.rs$/i,                    label: 'src/lib.rs',    priority: 90 },
  // Java
  { pattern: /^src\/main\/java\/.*Application\.java$/i, label: 'Application.java', priority: 85 },
  { pattern: /^src\/main\/java\/.*Main\.java$/i,        label: 'Main.java',        priority: 82 },
  // Nested source entries
  { pattern: /^app\/index\.(ts|tsx|js|jsx)$/i,     label: 'app/index',     priority: 80 },
  { pattern: /^pages\/index\.(ts|tsx|js|jsx)$/i,   label: 'pages/index',   priority: 78 },
  { pattern: /^app\/page\.(ts|tsx|js|jsx)$/i,      label: 'app/page',      priority: 78 },
];

// ═══════════════ CORE MODULE PATTERNS ═══════════════

/**
 * Directory patterns indicating core modules.
 */
const CORE_DIR_PATTERNS = [
  { pattern: /^src\/core\//i,         label: 'Core' },
  { pattern: /^core\//i,              label: 'Core' },
  { pattern: /^src\/lib\//i,          label: 'Library' },
  { pattern: /^lib\//i,              label: 'Library' },
  { pattern: /^src\/engine\//i,       label: 'Engine' },
  { pattern: /^engine\//i,           label: 'Engine' },
  { pattern: /^src\/modules\//i,      label: 'Modules' },
  { pattern: /^modules\//i,          label: 'Modules' },
  { pattern: /^src\/services\//i,     label: 'Services' },
  { pattern: /^services\//i,         label: 'Services' },
  { pattern: /^src\/controllers\//i,  label: 'Controllers' },
  { pattern: /^controllers\//i,      label: 'Controllers' },
  { pattern: /^src\/api\//i,          label: 'API Layer' },
  { pattern: /^api\//i,              label: 'API Layer' },
  { pattern: /^src\/routes\//i,       label: 'Routes' },
  { pattern: /^routes\//i,           label: 'Routes' },
  { pattern: /^src\/models\//i,       label: 'Models' },
  { pattern: /^models\//i,           label: 'Models' },
  { pattern: /^src\/components\//i,   label: 'Components' },
  { pattern: /^components\//i,       label: 'Components' },
  { pattern: /^src\/pages\//i,        label: 'Pages' },
  { pattern: /^pages\//i,            label: 'Pages' },
  { pattern: /^src\/utils\//i,        label: 'Utilities' },
  { pattern: /^utils\//i,            label: 'Utilities' },
  { pattern: /^src\/hooks\//i,        label: 'Hooks' },
  { pattern: /^hooks\//i,            label: 'Hooks' },
  { pattern: /^src\/store\//i,        label: 'State Management' },
  { pattern: /^store\//i,            label: 'State Management' },
  { pattern: /^src\/middleware\//i,   label: 'Middleware' },
  { pattern: /^middleware\//i,       label: 'Middleware' },
];

// ═══════════════ PUBLIC API ═══════════════

/**
 * Detect entry points from the file tree.
 *
 * @param {string[]} filePaths - All file paths from the repo tree.
 * @returns {{ entryPoints: { path: string, priority: number }[], primaryEntry: string | null }}
 */
export const detectEntryPoints = (filePaths) => {
  const matches = [];

  for (const fp of filePaths) {
    for (const { pattern, priority } of ENTRY_PATTERNS) {
      if (pattern.test(fp)) {
        matches.push({ path: fp, priority });
        break; // one match per file
      }
    }
  }

  // Sort by priority descending
  matches.sort((a, b) => b.priority - a.priority);

  // Deduplicate
  const seen = new Set();
  const unique = matches.filter((m) => {
    if (seen.has(m.path)) return false;
    seen.add(m.path);
    return true;
  });

  return {
    entryPoints: unique.slice(0, 5), // top 5 entry points
    primaryEntry: unique.length > 0 ? unique[0].path : null,
  };
};

/**
 * Detect core module directories from the file tree.
 *
 * @param {string[]} filePaths
 * @returns {{ label: string, directory: string, fileCount: number }[]}
 */
export const detectCoreModules = (filePaths) => {
  const dirMap = new Map(); // label → { directory, fileCount }

  for (const fp of filePaths) {
    for (const { pattern, label } of CORE_DIR_PATTERNS) {
      if (pattern.test(fp)) {
        // Extract directory path (up to first matching dir)
        const match = fp.match(pattern);
        if (match) {
          const dir = match[0];
          if (!dirMap.has(dir)) {
            dirMap.set(dir, { label, directory: dir, fileCount: 0 });
          }
          dirMap.get(dir).fileCount++;
        }
        break;
      }
    }
  }

  // Convert to array, sort by file count descending
  const modules = [...dirMap.values()]
    .sort((a, b) => b.fileCount - a.fileCount)
    .slice(0, 8); // top 8 modules

  return modules;
};

/**
 * Detect major directories (top-level and src/ level).
 *
 * @param {string[]} filePaths
 * @returns {string[]}
 */
export const detectMajorDirectories = (filePaths) => {
  const dirSet = new Set();

  for (const fp of filePaths) {
    const parts = fp.split('/');
    if (parts.length > 1) {
      dirSet.add(parts[0] + '/');
      // Also capture second level within src/
      if (parts[0].toLowerCase() === 'src' && parts.length > 2) {
        dirSet.add(`src/${parts[1]}/`);
      }
    }
  }

  return [...dirSet].sort();
};
