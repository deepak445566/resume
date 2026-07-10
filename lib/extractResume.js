// Extracts plain text from an uploaded resume file (PDF or DOCX).
// Imported by app/api/upload/route.js — kept separate so the extraction
// logic can be reused (e.g. by the compare API) without duplicating it.

import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const PDF_TYPE = "application/pdf";
const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * @param {Buffer} buffer - raw file bytes
 * @param {string} fileName - original file name, used to infer type as a fallback
 * @param {string} mimeType - the file's reported MIME type
 * @returns {Promise<{ text: string, wordCount: number }>}
 */
export default async function extractResume(buffer, fileName, mimeType) {
  const lowerName = fileName.toLowerCase();
  const isPdf = mimeType === PDF_TYPE || lowerName.endsWith(".pdf");
  const isDocx = mimeType === DOCX_TYPE || lowerName.endsWith(".docx");

  let text = "";

  if (isPdf) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    // Strip the "-- N of N --" page-break markers PDFParse inserts between pages.
    text = result.text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, "\n");
  } else if (isDocx) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error("Unsupported file type. Only PDF and DOCX are supported.");
  }

  text = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (!text) {
    throw new Error(
      "No readable text was found in this file. It may be a scanned image without selectable text."
    );
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return { text, wordCount };
}
