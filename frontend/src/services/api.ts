import {
  HealthResponse,
  StatusResponse,
  IndexResponse,
  QueryResponse,
} from '../types/api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errorMessage =
              typeof errorData.detail === 'string'
                ? errorData.detail
                : JSON.stringify(errorData.detail);
          }
        } catch {
          // Response body was not JSON
        }
        throw new Error(errorMessage);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          throw new Error(
            'Unable to connect to the backend. Please ensure the FastAPI server is running on ' +
              this.baseUrl
          );
        }
        throw err;
      }
      throw new Error('An unexpected error occurred.');
    }
  }

  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async getRepositoryStatus(
    owner: string,
    repo: string
  ): Promise<StatusResponse> {
    return this.request<StatusResponse>(
      `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/status`
    );
  }

  async indexRepository(url: string): Promise<IndexResponse> {
    return this.request<IndexResponse>('/repositories/index', {
      method: 'POST',
      body: JSON.stringify({ url: url.trim() }),
    });
  }

  async queryRepository(
    repositoryUrl: string,
    question: string,
    topK: number = 5
  ): Promise<QueryResponse> {
    return this.request<QueryResponse>('/repositories/query', {
      method: 'POST',
      body: JSON.stringify({
        repository_url: repositoryUrl.trim(),
        question: question.trim(),
        top_k: topK,
      }),
    });
  }
}

export const api = new ApiService(API_BASE_URL);
