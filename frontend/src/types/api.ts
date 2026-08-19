export interface HealthResponse {
  status: string;
}

export interface StatusResponse {
  repository: string;
  collection: string;
  indexed: boolean;
  chunks: number;
}

export interface IndexRequest {
  url: string;
}

export interface IndexResponse {
  repository: string;
  collection: string;
  indexed: boolean;
  chunks: number;
  message?: string;
}

export interface QueryRequest {
  repository_url: string;
  question: string;
  top_k?: number;
}

export interface SourceItem {
  file_path: string;
  chunk_id: number;
  score: number;
  language?: string;
  content?: string;
}

export interface QueryResponse {
  repository: string;
  collection: string;
  question: string;
  answer: string;
  sources: SourceItem[];
}
