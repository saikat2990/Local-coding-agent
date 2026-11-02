import './setup';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/app';

export interface TestResponse {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}

export interface TestApi {
  request(method: string, path: string, body?: unknown): Promise<TestResponse>;
  close(): Promise<void>;
}

// Starts the app on a random port and returns a small fetch wrapper.
export async function startTestServer(): Promise<TestApi> {
  const server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;

  // Pass a string as body to send it raw (e.g. to test malformed JSON).
  async function request(method: string, path: string, body?: unknown): Promise<TestResponse> {
    const res = await fetch(baseUrl + path, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: typeof body === 'string' ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  }

  function close(): Promise<void> {
    return new Promise((resolve) => server.close(() => resolve()));
  }

  return { request, close };
}
