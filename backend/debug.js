const fs = require('fs');

const data = JSON.parse(fs.readFileSync('/tmp/test-analysis2.json', 'utf8'));

console.log("type of metadata:", typeof data.metadata, data.metadata === null);
console.log("type of languages:", typeof data.languages, data.languages === null);
console.log("type of summary:", typeof data.summary, data.summary === null);
console.log("type of folderExplanation:", typeof data.folderExplanation, data.folderExplanation === null);
console.log("type of techStack:", typeof data.techStack, data.techStack === null);
console.log("type of dependenciesExplanation:", typeof data.dependenciesExplanation, data.dependenciesExplanation === null);
console.log("type of architecture:", typeof data.architecture, data.architecture === null);
console.log("type of runInstructions:", typeof data.runInstructions, data.runInstructions === null);
console.log("type of keyFiles:", typeof data.keyFiles, data.keyFiles === null, Array.isArray(data.keyFiles));
console.log("type of complexity:", typeof data.complexity, data.complexity === null);

if(data.complexity) {
  console.log("complexity score:", Number.isNaN(data.complexity.score), typeof data.complexity.score);
  console.log("complexity numFiles:", Number.isNaN(data.complexity.numFiles), typeof data.complexity.numFiles);
}

console.log("type of tree:", typeof data.tree, data.tree === null, Array.isArray(data.tree));
console.log("type of repoId:", typeof data.repoId, data.repoId === null);
