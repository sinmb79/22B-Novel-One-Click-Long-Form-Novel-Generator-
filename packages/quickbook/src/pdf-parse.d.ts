declare module "pdf-parse" {
  export interface PdfParseResult {
    text: string;
  }

  export default function pdfParse(buffer: Buffer): Promise<PdfParseResult>;
}
