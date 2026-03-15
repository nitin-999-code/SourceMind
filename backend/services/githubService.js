import axios from 'axios';

export const fetchRepoMetadata = async (owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  const response = await axios.get(url, { headers });
  return response.data;
};

export const fetchRepoLanguages = async (owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/languages`;
  const headers = {};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  const response = await axios.get(url, { headers });
  return response.data;
};

export const fetchRepoTree = async (owner, repo, defaultBranch = 'main') => {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
  const headers = {};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  const response = await axios.get(url, { headers });
  return response.data;
};

export const fetchFileContent = async (owner, repo, path) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = { Accept: 'application/vnd.github.v3.raw' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.warn(`Error fetching file content for ${path}: ${error.message}`);
    return null;
  }
};
