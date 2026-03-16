// http.js — Rate-limited HTTP fetch with exponential backoff + jitter
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Per-domain rate limiters (last request timestamp + min interval)
const domainTimestamps = new Map();

/**
 * Enforce a minimum delay between requests to the same domain.
 */
async function rateLimit(url, minIntervalMs) {
  const domain = new URL(url).hostname;
  const now = Date.now();
  const last = domainTimestamps.get(domain) ?? 0;
  const wait = last + minIntervalMs - now;
  if (wait > 0) {
    await sleep(wait);
  }
  domainTimestamps.set(domain, Date.now());
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jitter(ms) {
  return ms * (0.8 + Math.random() * 0.4);
}

/**
 * Fetch JSON from a URL with retry + exponential backoff.
 * @param {string} url
 * @param {object} options
 * @param {number} options.rateLimit - ms between requests to same domain
 * @param {number} options.maxRetries - default 4
 * @param {number} options.baseDelay - initial backoff ms, default 1000
 * @param {boolean} options.dryRun
 * @param {Record<string,string>} options.headers
 */
export async function fetchJSON(url, options = {}) {
  const {
    rateLimit: rl = 0,
    maxRetries = 4,
    baseDelay = 1000,
    dryRun = false,
    headers = {},
  } = options;

  if (dryRun) {
    console.log(`[DRY-RUN] GET ${url}`);
    return null;
  }

  if (rl > 0) await rateLimit(url, rl);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Accept': 'application/json',
          ...headers,
        },
      });

      if (res.status === 429 || res.status >= 500) {
        const delay = jitter(baseDelay * Math.pow(2, attempt));
        if (attempt < maxRetries) {
          await sleep(delay);
          continue;
        }
        throw new Error(`HTTP ${res.status} after ${maxRetries} retries: ${url}`);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${url}`);
      }

      return await res.json();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = jitter(baseDelay * Math.pow(2, attempt));
      await sleep(delay);
    }
  }
}

/**
 * Download a binary file (MP3, image) to disk with retry.
 * Returns the number of bytes written, or 0 on failure.
 * @param {string} url
 * @param {string} destPath - absolute path to write to
 * @param {object} options
 */
export async function downloadFile(url, destPath, options = {}) {
  const {
    rateLimit: rl = 0,
    maxRetries = 4,
    baseDelay = 1000,
    dryRun = false,
    headers = {},
    minSize = 0,
  } = options;

  if (dryRun) {
    console.log(`[DRY-RUN] DOWNLOAD ${url} → ${destPath}`);
    return -1; // sentinel for dry-run
  }

  if (rl > 0) await rateLimit(url, rl);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          ...headers,
        },
      });

      if (res.status === 429 || res.status >= 500) {
        const delay = jitter(Math.max(baseDelay, 5000) * Math.pow(2, attempt));
        if (attempt < maxRetries) {
          await sleep(delay);
          continue;
        }
        throw new Error(`HTTP ${res.status} after ${maxRetries} retries`);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${url}`);
      }

      // Stream to file
      const writer = createWriteStream(destPath);
      const nodeStream = Readable.fromWeb(res.body);
      await pipeline(nodeStream, writer);

      // Validate file size
      const { statSync } = await import('fs');
      const { size } = statSync(destPath);
      if (minSize > 0 && size < minSize) {
        const { unlinkSync } = await import('fs');
        unlinkSync(destPath);
        throw new Error(`File too small (${size} bytes < ${minSize}) — likely error response`);
      }

      return size;
    } catch (err) {
      if (attempt === maxRetries) {
        // Clean up partial file if it exists
        try {
          const { unlinkSync, existsSync } = await import('fs');
          if (existsSync(destPath)) unlinkSync(destPath);
        } catch { /* ignore */ }
        throw err;
      }
      const delay = jitter(baseDelay * Math.pow(2, attempt));
      await sleep(delay);
    }
  }
}

/**
 * Process items in concurrent batches.
 * @template T
 * @param {T[]} items
 * @param {number} concurrency
 * @param {(item: T) => Promise<void>} fn
 */
export async function processInBatches(items, concurrency, fn) {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.all(batch.map(fn));
  }
}
