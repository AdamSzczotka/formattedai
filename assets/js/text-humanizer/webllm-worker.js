import * as webllm from '@mlc-ai/web-llm';

let engine = null;
let currentModelId = null;
let cancelled = false;

const SUPPORTED_MODELS = {
  'qwen-1.5b': 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC',
  'qwen-0.5b': 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC',
  'llama-1b': 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
};

function send(msg) {
  try {
    self.postMessage(msg);
  } catch (err) {
    try { self.postMessage({ type: 'error', error: 'postMessage failed: ' + (err && err.message || err) }); } catch (_) {}
  }
}

async function initEngine(modelId) {
  if (engine && currentModelId === modelId) {
    send({ type: 'ready', modelId });
    return;
  }
  cancelled = false;
  const initProgressCallback = (report) => {
    if (cancelled) return;
    send({
      type: 'progress',
      progress: report.progress,
      text: report.text,
      timeElapsed: report.timeElapsed,
    });
  };

  try {
    engine = await webllm.CreateMLCEngine(modelId, {
      initProgressCallback,
    });
    currentModelId = modelId;
    if (!cancelled) send({ type: 'ready', modelId });
  } catch (err) {
    send({ type: 'error', error: String(err && err.message || err), stage: 'init' });
    engine = null;
    currentModelId = null;
  }
}

async function generate(messages, params, requestId) {
  if (!engine) {
    send({ type: 'generation-error', requestId, error: 'Engine not initialized' });
    return;
  }
  cancelled = false;

  try {
    let aggregated = '';
    const completion = await engine.chat.completions.create({
      messages,
      temperature: params.temperature ?? 0.85,
      top_p: params.top_p ?? 0.95,
      max_tokens: params.max_tokens ?? 1024,
      stream: true,
    });

    for await (const chunk of completion) {
      if (cancelled) {
        send({ type: 'generation-cancelled', requestId });
        return;
      }
      const delta = chunk.choices?.[0]?.delta?.content || '';
      if (delta) {
        aggregated += delta;
        send({ type: 'token', requestId, text: delta });
      }
    }

    send({ type: 'generation-done', requestId, output: aggregated });
  } catch (err) {
    send({ type: 'generation-error', requestId, error: String(err && err.message || err) });
  }
}

self.addEventListener('error', (e) => {
  send({ type: 'error', error: 'worker.onerror: ' + (e.message || 'unknown'), filename: e.filename, lineno: e.lineno });
});

self.addEventListener('unhandledrejection', (e) => {
  const r = e.reason;
  send({ type: 'error', error: 'worker.unhandledrejection: ' + (r && r.message || String(r)) });
});

self.addEventListener('message', async (e) => {
  const msg = e.data || {};
  try {
    switch (msg.type) {
      case 'init': {
        const modelId = SUPPORTED_MODELS[msg.modelKey] || SUPPORTED_MODELS['qwen-1.5b'];
        await initEngine(modelId);
        break;
      }
      case 'generate': {
        await generate(msg.messages, msg.params || {}, msg.requestId);
        break;
      }
      case 'cancel': {
        cancelled = true;
        try { engine && engine.interruptGenerate && engine.interruptGenerate(); } catch (_) {}
        break;
      }
      case 'unload': {
        try { engine && engine.unload && await engine.unload(); } catch (_) {}
        engine = null;
        currentModelId = null;
        send({ type: 'unloaded' });
        break;
      }
      default:
        send({ type: 'error', error: 'unknown_message_type: ' + msg.type });
    }
  } catch (err) {
    send({ type: 'error', error: 'handler threw: ' + (err && err.message || err), msgType: msg.type });
  }
});

send({ type: 'worker-loaded' });
