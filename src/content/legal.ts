import { PRIVACY_POLICY, TERMS_OF_SERVICE, LEGAL_DOCUMENTS } from "@/data/legal";
import type { LegalDocument } from "@/data/types";
import { getContentClient } from "./client";

export { PRIVACY_POLICY, TERMS_OF_SERVICE, LEGAL_DOCUMENTS };

/**
 * Synchronous content accessor for a legal document by its identifier ("privacy" | "terms").
 */
export function getLegalDocument(id: "privacy" | "terms"): LegalDocument {
  const doc = LEGAL_DOCUMENTS[id];
  if (!doc) {
    throw new Error(`Legal document not found for id: ${id}`);
  }
  return doc;
}

/**
 * Synchronous content accessor for all available legal documents.
 */
export function getLegalDocuments(): LegalDocument[] {
  return Object.values(LEGAL_DOCUMENTS);
}

/**
 * Asynchronous content accessor for a legal document (Seam 1 / S10.2).
 */
export async function fetchLegalDocument(id: "privacy" | "terms"): Promise<LegalDocument | null> {
  return getContentClient().getLegalDocument(id);
}

/**
 * Asynchronous content accessor for all legal documents.
 */
export async function fetchLegalDocuments(): Promise<LegalDocument[]> {
  return getContentClient().getLegalDocuments();
}
