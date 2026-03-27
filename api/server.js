const express = require('express');
const { load } = require('cheerio');
const rateLimit = require('express-rate-limit');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3100;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://formattedai.pl';
const FETCH_TIMEOUT = 5000;
const MAX_BODY_SIZE = 50 * 1024; // 50KB

// --- Rate limiting: 10 req/min per IP ---
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again in a minute.' }
}));

// --- CORS ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === ALLOWED_ORIGIN || ALLOWED_ORIGIN === '*') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// --- URL validation ---
const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^fc00:/i,
  /^fe80:/i,
  /^::1$/,
  /^localhost$/i,
];

function isPrivateHost(hostname) {
  return PRIVATE_RANGES.some(re => re.test(hostname));
}

function validateUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (isPrivateHost(parsed.hostname)) return null;
  return parsed.href;
}

// --- Meta parser ---
function parseMeta(html, sourceUrl) {
  const $ = load(html);

  const meta = (name) => $(`meta[name="${name}"]`).attr('content') || '';
  const prop = (property) => $(`meta[property="${property}"]`).attr('content') || '';

  // Favicon
  let favicon = '';
  const iconLink = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').first();
  if (iconLink.length) {
    favicon = iconLink.attr('href') || '';
    if (favicon && !favicon.startsWith('http')) {
      try {
        favicon = new URL(favicon, sourceUrl).href;
      } catch { favicon = ''; }
    }
  }

  return {
    title: $('title').text().trim(),
    description: meta('description'),
    canonical: $('link[rel="canonical"]').attr('href') || '',
    lang: $('html').attr('lang') || '',
    keywords: meta('keywords'),
    og: {
      title: prop('og:title'),
      description: prop('og:description'),
      url: prop('og:url'),
      image: prop('og:image'),
      type: prop('og:type'),
      site_name: prop('og:site_name'),
      locale: prop('og:locale'),
    },
    twitter: {
      card: meta('twitter:card'),
      title: meta('twitter:title'),
      description: meta('twitter:description'),
      image: meta('twitter:image'),
      site: meta('twitter:site'),
    },
    favicon,
  };
}

// --- Endpoint ---
app.get('/fetch-meta', async (req, res) => {
  const url = validateUrl(req.query.url || '');
  if (!url) {
    return res.status(400).json({ error: 'Invalid or blocked URL.' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FormattedAI-MetaFetcher/1.0',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({ error: `Remote server returned ${response.status}.` });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/xhtml')) {
      return res.status(400).json({ error: 'URL does not point to an HTML page.' });
    }

    // Read limited body
    const reader = response.body.getReader();
    const chunks = [];
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.length;
      chunks.push(value);
      if (totalSize >= MAX_BODY_SIZE) break;
    }

    const html = Buffer.concat(chunks).toString('utf-8');
    const result = parseMeta(html, url);

    res.json(result);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out (5s).' });
    }
    return res.status(502).json({ error: 'Could not fetch the URL.' });
  }
});

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Meta proxy running on port ${PORT}`);
});
