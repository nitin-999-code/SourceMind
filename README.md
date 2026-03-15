# SourceMind AI

SourceMind AI is a full-stack web application that allows developers to paste a GitHub repository URL and receive a comprehensive, AI-generated explanation of the repository. It analyzes metadata, file structures, tech stacks, and architecture while also providing an interactive AI chat interface to query the codebase directly.

## Features
- **Repository Analysis**: Seamless integration with GitHub REST API for live data.
- **AI Explanations**: Uses Groq's high-performance LLMs (llama3-70b) to provide natural language documentation for the folder structure, system architecture, dependencies, and general project purpose.
- **AI Chat with Repository**: Allows natural language queries against your repository's structure utilizing vector search via ChromaDB and embedding models from HuggingFace (`sentence-transformers`).
- **Modern UI**: Polished, responsive layout based on React, Vite, Tailwind CSS, Shadcn UI elements, and a sleek dark theme.

## Architecture Stack
- **Frontend**: React, Vite, Tailwind CSS, Context/Query integrations for React, Lucide Icons, Marked (for AI Markdown).
- **Backend**: Node.js, Express.
- **AI / AI APIs**: Groq SDK (`llama3-70b-8192`), Hugging Face `all-MiniLM-L6-v2` (`@xenova/transformers` locally generated).
- **Vector Database**: ChromaDB (locally hosted or remote instance).

## Setup & Running Locally

### Prerequisites
- Node.js > 18
- Docker (optional, but requested for running ChromaDB locally, alternatively ensure `CHROMA_URL` is set or default is exposed at port 8000).

### 1. Setup Chroma DB
You will need a vector database to handle embeddings. If using Docker:
```bash
docker run -p 8000:8000 ghcr.io/chroma-core/chroma:latest
```

### 2. Configure Backend
```bash
cd backend
npm install
```
Create a `.env` file from the sample and provide your keys:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=your_github_token_here_optional # Highly recommended to prevent rate limiting
```
Start the backend server:
```bash
npm run dev
```

### 3. Configure Frontend
```bash
cd frontend
npm install
npm run dev
```

Enjoy exploring your repositories securely with an active AI companion!
