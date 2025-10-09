/**
 * 文档相关的类型定义
 */

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  content?: string;
  extractedText?: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  uploadedAt: Date;
  processedAt?: Date;
  category?: string;
  tags?: string[];
  thumbnail?: string;
}

export interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  searchResults: Document[];
  categories: string[];
}

export interface DocumentUploadResult {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface DocumentSearchQuery {
  query: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DocumentSearchResult {
  documents: Document[];
  totalCount: number;
  query: string;
}

export interface DocumentProcessingStatus {
  documentId: string;
  status: Document['status'];
  progress?: number;
  error?: string;
}