export interface OcrResponse { text: string }
export interface CleanStructureResponse { cleaned_text: string; structured: any }
export interface ProcessResult { ocrText: string; structured: Record<string, any> | null }

export declare class OcrApi {
  constructor(baseUrl?: string)
  baseUrl: string
  uploadImage(file: File): Promise<OcrResponse>
  cleanAndStructure(text: string): Promise<CleanStructureResponse>
  process(file: File): Promise<ProcessResult>
}

