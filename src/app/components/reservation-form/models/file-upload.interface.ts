export interface FileUpload {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  downloadURL: string | null;
  error: string | null;
}
