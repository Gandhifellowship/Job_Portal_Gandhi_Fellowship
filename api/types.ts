/**
 * Minimal request/response types for Vercel serverless API routes.
 * Use instead of Next.js types when not using Next.js.
 */
import type { IncomingMessage, ServerResponse } from 'http';

export interface ApiRequest extends IncomingMessage {
  body?: unknown;
}

export interface ApiResponse extends ServerResponse {
  status: (code: number) => ApiResponse;
  json: (data: unknown) => void;
  end: () => void;
}
