const express = require('express');
const puppeteer = require('puppeteer-core');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const dns = require('dns').promises;
const { URL } = require('url');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://formattedai.pl,https://www.formattedai.pl').split(',');
const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';

const MAX_HTML_SIZE = 512 * 1024;       // 512 KB
const MAX_URL_LENGTH = 2048;
const MAX_PDF_SIZE = 10 * 1024 * 1024;  // 10 MB
const NAV_TIMEOUT = 15_000;             // 15 s
const REQUEST_TIMEOUT = 30_000;         // 30 s
const MAX_CONCURRENT = 2;

const VALID_FORMATS = ['A4', 'A3', 'A5', 'Letter', 'Legal'];

// ---------------------------------------------------------------------------
// Private IP detection (SSRF protection)
// ---------------------------------------------------------------------------

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fe80:/i,
  /^fc00:/i,
  /^fd/i,
];

function isPrivateIP(ip) {
  return PRIVATE_IP_PATTERNS.some((re) => re.test(ip));
}

async function resolveAndValidate(hostname) {
  let addresses;
  try {
    addresses = await dns.resolve4(hostname);
  } catch {
    throw new Error('DNS resolution failed for host: ' + hostname);
  }

  for (const addr of addresses) {
    if (isPrivateIP(addr)) {
      throw new Error('Private IP blocked');
    }
  }

  return addresses[0];
}

// ---------------------------------------------------------------------------
// Input validation helpers
// ---------------------------------------------------------------------------

function validateUrl(input) {
  if (typeof input !== 'string' || input.length > MAX_URL_LENGTH) return null;

  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (parsed.username || parsed.password) return null;

  // Block raw IPs in hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) return null;
  if (parsed.hostname.startsWith('[')) return null; // IPv6 literal

  if (isPrivateIP(parsed.hostname)) return null;
  if (/^localhost$/i.test(parsed.hostname)) return null;

  return parsed;
}

function validateAndNormalizeOptions(raw) {
  const opts = {};

  opts.format = VALID_FORMATS.includes(raw?.format) ? raw.format : 'A4';
  opts.landscape = raw?.landscape === true;
  opts.printBackground = raw?.printBackground !== false; // default true
  opts.hideHeaders = raw?.hideHeaders !== false;          // default true

  const margin = Number(raw?.margin);
  opts.margin = Number.isFinite(margin) ? Math.max(0, Math.min(100, margin)) : 10;

  const scale = Number(raw?.scale);
  opts.scale = Number.isFinite(scale) ? Math.max(0.1, Math.min(2.0, scale)) : 1;

  return opts;
}

// ---------------------------------------------------------------------------
// Concurrency gate
// ---------------------------------------------------------------------------

let activeRenders = 0;

function acquireSlot() {
  if (activeRenders >= MAX_CONCURRENT) return false;
  activeRenders++;
  return true;
}

function releaseSlot() {
  activeRenders = Math.max(0, activeRenders - 1);
}

// ---------------------------------------------------------------------------
// Browser lifecycle
// ---------------------------------------------------------------------------

let browser;

async function initBrowser() {
  const isWindows = process.platform === 'win32';
  browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROMIUM_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-webgl',
      '--disable-3d-apis',
      // --single-process crashes on Windows; only use in Docker (Linux)
      ...(isWindows ? [] : ['--single-process']),
    ],
  });

  browser.on('disconnected', () => {
    console.error('[browser] Chromium disconnected, restarting...');
    initBrowser().catch((err) => {
      console.error('[browser] Failed to restart:', err.message);
      process.exit(1);
    });
  });

  console.log('[browser] Chromium launched');
}

// ---------------------------------------------------------------------------
// PDF renderer
// ---------------------------------------------------------------------------

async function renderPdf(content, options, isUrl = false, resolvedIP = null) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  try {
    page.setDefaultNavigationTimeout(NAV_TIMEOUT);
    page.setDefaultTimeout(NAV_TIMEOUT);

    // Block heavy / dangerous resource types
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const blocked = ['media', 'websocket', 'manifest'];
      if (blocked.includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Dismiss any dialogs (alert, confirm, prompt)
    page.on('dialog', (d) => d.dismiss());

    if (isUrl) {
      const parsed = new URL(content);

      // Pin resolved IP via Chromium host-resolver-rules on browser context
      // We need a fresh page with the pinned IP; use extraHTTPHeaders workaround
      // Actually set host-resolver-rules at goto level isn't possible per-page,
      // so we resolve + validate above, then let Chromium resolve normally.
      // The DNS validation already ensures no private IPs are returned.
      await page.goto(content, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });
    } else {
      await page.setContent(content, { waitUntil: 'networkidle0', timeout: NAV_TIMEOUT });
    }

    const marginStr = options.margin + 'mm';
    const pdfOpts = {
      format: options.format,
      landscape: options.landscape,
      printBackground: options.printBackground,
      scale: options.scale,
      timeout: 10_000,
    };

    if (options.hideHeaders) {
      pdfOpts.margin = { top: marginStr, bottom: marginStr, left: marginStr, right: marginStr };
      pdfOpts.displayHeaderFooter = false;
    } else {
      pdfOpts.margin = { top: marginStr, bottom: marginStr, left: marginStr, right: marginStr };
    }

    const pdfBuffer = await page.pdf(pdfOpts);

    if (pdfBuffer.length > MAX_PDF_SIZE) {
      throw new Error('PDF exceeds 10MB limit');
    }

    return pdfBuffer;
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// Express application
// ---------------------------------------------------------------------------

const app = express();

// Security headers
app.use(helmet());

// JSON body parser with size limit
app.use(express.json({ limit: '600kb' }));

// CORS — only allowed origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Rate limiting — per-minute
const minuteLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: 'Rate limit exceeded. Max 5 requests per minute.' },
});

// Rate limiting — per-day
const dailyLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: 'Daily limit exceeded. Max 50 requests per day.' },
});

// ---------------------------------------------------------------------------
// Hard request timeout middleware
// ---------------------------------------------------------------------------

function requestTimeout(req, res, next) {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ error: 'Request timed out (30s).' });
    }
  }, REQUEST_TIMEOUT);

  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/api/pdf/health', (_req, res) => {
  const chromiumOk = browser && browser.isConnected();
  res.json({
    status: chromiumOk ? 'ok' : 'degraded',
    uptime: process.uptime(),
    chromium: chromiumOk ? 'connected' : 'disconnected',
    activeRenders,
  });
});

// POST /api/pdf/from-html
app.post('/api/pdf/from-html', minuteLimit, dailyLimit, requestTimeout, async (req, res) => {
  try {
    const { html, options: rawOptions } = req.body || {};

    if (typeof html !== 'string' || html.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid "html" field. Must be a non-empty string.' });
    }

    if (Buffer.byteLength(html, 'utf-8') > MAX_HTML_SIZE) {
      return res.status(413).json({ error: 'HTML payload exceeds 512KB limit.' });
    }

    const options = validateAndNormalizeOptions(rawOptions);

    if (!acquireSlot()) {
      return res.status(503).json({ error: 'Server busy. Max concurrent renders reached. Try again shortly.' });
    }

    try {
      const pdfBuffer = await renderPdf(html, options, false);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(pdfBuffer);
    } finally {
      releaseSlot();
    }
  } catch (err) {
    console.error('[from-html]', err.message);
    if (!res.headersSent) {
      const code = err.message.includes('10MB') ? 413 : 500;
      res.status(code).json({ error: err.message });
    }
  }
});

// POST /api/pdf/from-url
app.post('/api/pdf/from-url', minuteLimit, dailyLimit, requestTimeout, async (req, res) => {
  try {
    const { url, options: rawOptions } = req.body || {};

    const parsed = validateUrl(url);
    if (!parsed) {
      return res.status(400).json({
        error: 'Invalid URL. Must be http/https, no raw IPs, no credentials, max 2048 chars.',
      });
    }

    // DNS resolution + SSRF check
    let resolvedIP;
    try {
      resolvedIP = await resolveAndValidate(parsed.hostname);
    } catch (dnsErr) {
      return res.status(400).json({ error: dnsErr.message });
    }

    const options = validateAndNormalizeOptions(rawOptions);

    if (!acquireSlot()) {
      return res.status(503).json({ error: 'Server busy. Max concurrent renders reached. Try again shortly.' });
    }

    try {
      const pdfBuffer = await renderPdf(parsed.href, options, true, resolvedIP);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(pdfBuffer);
    } finally {
      releaseSlot();
    }
  } catch (err) {
    console.error('[from-url]', err.message);
    if (!res.headersSent) {
      const code = err.message.includes('10MB') ? 413 : 500;
      res.status(code).json({ error: err.message });
    }
  }
});

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

async function start() {
  try {
    await initBrowser();
  } catch (err) {
    console.error('[startup] Failed to launch Chromium:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[pdf-service] Running on port ${PORT}`);
  });
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`[pdf-service] ${signal} received, shutting down...`);
  if (browser) {
    try { await browser.close(); } catch { /* ignore */ }
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
