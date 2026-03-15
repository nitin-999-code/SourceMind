import { ChromaClient } from 'chromadb';
import { pipeline } from '@xenova/transformers';

const chromaClient = new ChromaClient({ path: process.env.CHROMA_URL || "http://localhost:8000" });
let extractor = null;

// Initialize transformer pipeline for embeddings
const getExtractor = async () => {
  if (!extractor) {
    // using Xenova's version of HuggingFace's sentence-transformers
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
};

export const generateEmbedding = async (text) => {
  const ext = await getExtractor();
  const output = await ext(text, { pooling: 'mean', normalize: true });
  // output is a tensor, .tolist() converts it to JS array
  // If we pass a single string, it may return a single array, but usually returns [[...]] depending on nesting
  let list = output.tolist();
  if (Array.isArray(list[0])) {
    return list[0];
  }
  return list;
};

const dummyEmbeddingFunction = {
  generate: async (texts) => {
    const embeddings = [];
    for (const text of texts) {
      embeddings.push(await generateEmbedding(text));
    }
    return embeddings;
  }
};

export const storeDocuments = async (repoName, chunks, metadatas) => {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: repoName.replace(/[^a-zA-Z0-9_-]/g, '_'),
      embeddingFunction: dummyEmbeddingFunction
    });
    
    // Generate embeddings one by one to avoid memory spikes, or batch them
    const embeddings = [];
    for (const chunk of chunks) {
      const emb = await generateEmbedding(chunk);
      embeddings.push(emb);
    }

    const ids = chunks.map((_, i) => `chunk_${Date.now()}_${i}`);
    
    await collection.upsert({
      ids,
      embeddings,
      documents: chunks,
      metadatas
    });
    
    return true;
  } catch (error) {
    console.warn("ChromaDB error:", error.message);
    return false;
  }
};

export const queryDocuments = async (repoName, query, nResults = 5) => {
  try {
    const collection = await chromaClient.getCollection({
      name: repoName.replace(/[^a-zA-Z0-9_-]/g, '_'),
      embeddingFunction: dummyEmbeddingFunction
    });
    
    const queryEmbedding = await generateEmbedding(query);
    
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding], // array of arrays
      nResults
    });
    
    if (results && results.documents && results.documents.length > 0) {
      return results.documents[0]; // documents is a 2D array [ [doc1, doc2] ]
    }
    return [];
  } catch (error) {
    console.warn("Chroma query error:", error.message);
    return [];
  }
};
