import { UploadApiOptions, UploadApiResponse } from 'cloudinary';

export interface CloudinaryUploadOptions extends UploadApiOptions {
  resource_type: "auto" | "image" | "video" | "raw";
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  invalidate?: boolean;
  quality?: string;
  fetch_format?: string;
  flags?: string;
  chunk_size?: number;
}

export interface CloudinaryInfo {
  url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
  timestamp: number;
}

export interface CloudinaryUploadResponse extends UploadApiResponse {
  secure_url: string;
}