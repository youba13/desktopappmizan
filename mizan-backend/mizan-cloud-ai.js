/*
  mizan-cloud-ai.js  —  ميزان AI Backend  (fixed)
  ─────────────────────────────────────────────────
  SETUP:
    1. Put this file + .env in the same folder (e.g. mizan-backend/)
    2. Run in that folder:
         npm init -y
         npm install express cors axios dotenv express-rate-limit
         node mizan-cloud-ai.js
    3. Leave the terminal open while using the app.
*/

require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const axios     = require('axios');
const rateLimit = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '4mb' }));

// ── Rate limit ─────────────────────────────────────────────────────────────
app.use('/api/ai/chat', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.body?.firm_id || req.ip,
  message: { error: 'حد الطلبات. حاول بعد 15 دقيقة.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Provider list ──────────────────────────────────────────────────────────
// The backend tries them in order. First one with a valid key wins.
const PROVIDERS = [
  {
    id:      'gemini',
    name:    'Gemini Flash',
    enabled: !!process.env.GEMINI_API_KEY,
    call:    callGemini,
  },
  {
    id:      'groq',
    name:    'Groq / Llama',
    enabled: !!process.env.GROQ_API_KEY,
    call:    callGroq,
  },
  {
    id:      'claude',
    name:    'Claude Haiku',
    enabled: !!process.env.ANTHROPIC_API_KEY,
    call:    callClaude,
  },
  {
    id:      'openai',
    name:    'GPT-4o Mini',
    enabled: !!process.env.OPENAI_API_KEY,
    call:    callOpenAI,
  },
];

// ── System prompt ──────────────────────────────────────────────────────────
const SYSTEM = `أنت مساعد قانوني ذكي مدمج في منصة ميزان لإدارة مكاتب المحاماة في الجزائر.
- أجب دائماً بالعربية الواضحة المناسبة للسياق القانوني الجزائري.
- كن موجزاً وعملياً — المحامي مشغول.
- إذا وُجدت بيانات من قاعدة البيانات في السياق، استخدمها مباشرةً في إجابتك.
- لا تخترع أرقاماً أو تواريخ أو أسماء غير موجودة في البيانات المعطاة.
- التسلسل القضائي الجزائري: المحكمة الابتدائية → مجلس قضائي (استئناف) → المحكمة العليا.
- مدد التقادم: 15 سنة مدني عام، 10 تجاري، 3 جنح، 10 جنايات.`;

// ── SSE helpers ────────────────────────────────────────────────────────────
function openSSE(res) {
  res.setHeader('Content-Type',      'text/event-stream');
  res.setHeader('Cache-Control',     'no-cache');
  res.setHeader('Connection',        'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
}

function sse(res, obj) {
  res.write('data: ' + JSON.stringify(obj) + '\n\n');
}

// ── PROVIDER: Google Gemini ────────────────────────────────────────────────
// Free tier: 15 req/min, 1M tokens/day
// Get key: https://aistudio.google.com/app/apikey
async function callGemini(messages, res) {
  const sysMsg  = messages.find(m => m.role === 'system');
  const history = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // Must have at least one user turn
  if (!history.length) {
    history.push({ role: 'user', parts: [{ text: 'مرحبا' }] });
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
              'gemini-2.0-flash:streamGenerateContent?alt=sse&key=' +
              process.env.GEMINI_API_KEY;

  const response = await axios.post(url, {
    system_instruction: { parts: [{ text: sysMsg?.content || SYSTEM }] },
    contents: history,
    generationConfig: {
      temperature:     0.4,
      maxOutputTokens: 1024,
    },
  }, {
    responseType: 'stream',
    timeout:      90000,
  });

  return new Promise((resolve, reject) => {
    let full = '';
    let buf  = '';

    response.data.on('data', chunk => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop(); // keep incomplete last line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === '[DONE]') continue;
        try {
          const parsed = JSON.parse(raw);
          const token  = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (token) {
            full += token;
            sse(res, { token });
          }
        } catch (_) {
          // skip malformed JSON
        }
      }
    });

    response.data.on('end',   () => resolve(full));
    response.data.on('error', err => reject(err));
  });
}

// ── PROVIDER: Groq ─────────────────────────────────────────────────────────
// Free tier: 30 req/min, extremely fast (700 tokens/sec)
// Get key: https://console.groq.com/keys
async function callGroq(messages, res) {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model:       'llama-3.3-70b-versatile',
      messages,
      stream:      true,
      temperature: 0.4,
      max_tokens:  1024,
    },
    {
      responseType: 'stream',
      timeout:      60000,
      headers: {
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
        'Content-Type':  'application/json',
      },
    }
  );
  return readOpenAIStream(response, res);
}

// ── PROVIDER: Anthropic Claude ─────────────────────────────────────────────
// Paid. Best Arabic quality. ~$0.004 per conversation.
// Get key: https://console.anthropic.com
async function callClaude(messages, res) {
  const sysMsg  = messages.find(m => m.role === 'system');
  const chatMsg = messages.filter(m => m.role !== 'system');

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      stream:     true,
      system:     sysMsg?.content || SYSTEM,
      messages:   chatMsg,
    },
    {
      responseType: 'stream',
      timeout:      90000,
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type':      'application/json',
      },
    }
  );

  return new Promise((resolve, reject) => {
    let full = '';
    let buf  = '';

    response.data.on('data', chunk => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === '[DONE]') continue;
        try {
          const d = JSON.parse(raw);
          if (d.type === 'content_block_delta') {
            const token = d.delta?.text || '';
            if (token) {
              full += token;
              sse(res, { token });
            }
          }
        } catch (_) {}
      }
    });

    response.data.on('end',   () => resolve(full));
    response.data.on('error', err => reject(err));
  });
}

// ── PROVIDER: OpenAI ───────────────────────────────────────────────────────
// Paid. Good Arabic. gpt-4o-mini is the cheapest option.
// Get key: https://platform.openai.com/api-keys
async function callOpenAI(messages, res) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model:       'gpt-4o-mini',
      messages,
      stream:      true,
      temperature: 0.4,
      max_tokens:  1024,
    },
    {
      responseType: 'stream',
      timeout:      90000,
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type':  'application/json',
      },
    }
  );
  return readOpenAIStream(response, res);
}

// ── Shared OpenAI-format stream reader (used by Groq + OpenAI) ────────────
async function readOpenAIStream(axiosResponse, res) {
  return new Promise((resolve, reject) => {
    let full = '';
    let buf  = '';

    axiosResponse.data.on('data', chunk => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === '[DONE]') continue;
        try {
          const token = JSON.parse(raw)?.choices?.[0]?.delta?.content || '';
          if (token) {
            full += token;
            sse(res, { token });
          }
        } catch (_) {}
      }
    });

    axiosResponse.data.on('end',   () => resolve(full));
    axiosResponse.data.on('error', err => reject(err));
  });
}

// ── Intent detection (injects DB context into the prompt) ─────────────────
function detectTool(msg) {
  if (/(جلس|موعد|تقويم|اليوم|هذا الأسبوع|غداً)/.test(msg)) return 'get_hearings';
  if (/(لم يدفع|مستحق|أتعاب|ديون|متأخر)/.test(msg))        return 'get_unpaid_fees';
  if (/(أولويات|ماذا أعمل|إحصائيات|عدد القضايا)/.test(msg)) return 'get_priorities';
  if (/(ملخص قضية|تفاصيل قضية|حالة قضية)/.test(msg))       return 'summarize_case';
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN CHAT ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/ai/chat', async (req, res) => {
  const {
    message,
    history    = [],
    firm_id    = 'demo',
    db_context = null,
  } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  openSSE(res);

  try {
    // Step 1 — detect intent and build DB context string
    const tool = detectTool(message);
    let ctxStr = '';

    if (tool && db_context) {
      sse(res, { status: 'tool_called', tool });
      ctxStr = '\n\n[بيانات من مكتبك — ' + tool + ']\n' +
        (typeof db_context === 'string' ? db_context : JSON.stringify(db_context, null, 2));
    }

    // Step 2 — assemble message array
    const msgs = [
      { role: 'system', content: SYSTEM + ctxStr },
      ...history.slice(-10),
      { role: 'user',   content: message },
    ];

    // Step 3 — find enabled providers
    const ordered = PROVIDERS.filter(p => p.enabled);

    if (ordered.length === 0) {
      sse(res, {
        token: '⚠️ لا يوجد مزود ذكاء اصطناعي مفعّل.\n\nأضف مفتاحاً في ملف .env:\n• GEMINI_API_KEY (مجاني)\n• GROQ_API_KEY (مجاني)',
        done:  true,
        error: 'no_provider',
      });
      return res.end();
    }

    // Step 4 — try providers one by one
    let fullText     = '';
    let usedProvider = null;
    let lastError    = null;

    for (const provider of ordered) {
      try {
        console.log('[' + provider.id + '] trying...');
        sse(res, { status: 'generating', provider: provider.name });

        fullText     = await provider.call(msgs, res);
        usedProvider = provider;

        console.log('[' + provider.id + '] OK — ' + fullText.length + ' chars');
        break; // success — stop trying

      } catch (err) {
        lastError = err;

        // Log the real error so you can see it in the terminal
        const status  = err.response?.status;
        const errBody = err.response?.data;
        console.error('[' + provider.id + '] FAILED:', status || err.code || err.message);
        if (errBody) {
          try { console.error('  detail:', JSON.stringify(errBody).slice(0, 300)); }
          catch (_) {}
        }

        sse(res, { status: 'fallback', from: provider.id, http_status: status });

        // Always try the next provider, regardless of error type
        await new Promise(r => setTimeout(r, 300));
      }
    }

    // Step 5 — send final event
    if (usedProvider) {
      sse(res, {
        done:      true,
        provider:  usedProvider.name,
        tool_used: tool,
        chars:     fullText.length,
      });
    } else {
      // All providers failed — send a helpful error
      const errDetail = lastError?.response?.status
        ? 'HTTP ' + lastError.response.status
        : (lastError?.code || lastError?.message || 'unknown');

      sse(res, {
        token: '❌ فشل الاتصال بكل مزودي الذكاء الاصطناعي.\n\n' +
               'آخر خطأ: ' + errDetail + '\n\n' +
               'تحقق من:\n' +
               '1. مفتاح API صحيح في ملف .env\n' +
               '2. اتصال الإنترنت يعمل\n' +
               '3. المفتاح ليس محدود الاستخدام\n\n' +
               'راجع الطرفية (terminal) للتفاصيل الكاملة.',
        done:  true,
        error: errDetail,
      });
    }

    res.end();

  } catch (outerErr) {
    console.error('Outer error:', outerErr.message);
    if (!res.headersSent) openSSE(res);
    sse(res, {
      token: 'خطأ داخلي: ' + outerErr.message,
      done:  true,
      error: outerErr.message,
    });
    res.end();
  }
});

// ═══════════════════════════════════════════════════════════════════════════
//  DIAGNOSTIC ENDPOINT — open this in browser to check everything
//  http://localhost:3001/api/ai/diagnose
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/ai/diagnose', async (req, res) => {
  const results = {
    server:   'running',
    node:     process.version,
    port:     PORT,
    env_file: 'loaded (keys shown as present/missing)',
    keys: {
      GEMINI_API_KEY:    process.env.GEMINI_API_KEY    ? '✅ present (' + process.env.GEMINI_API_KEY.slice(0,8) + '...)' : '❌ missing',
      GROQ_API_KEY:      process.env.GROQ_API_KEY      ? '✅ present (' + process.env.GROQ_API_KEY.slice(0,8)   + '...)' : '❌ missing',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✅ present'                                                    : '❌ missing',
      OPENAI_API_KEY:    process.env.OPENAI_API_KEY    ? '✅ present'                                                    : '❌ missing',
    },
    providers: PROVIDERS.map(p => ({
      id:      p.id,
      name:    p.name,
      enabled: p.enabled,
    })),
    active_provider: PROVIDERS.find(p => p.enabled)?.id || 'NONE — add a key to .env',
    instructions: {
      free_gemini: 'Get key at https://aistudio.google.com/app/apikey then add: GEMINI_API_KEY=your_key to .env',
      free_groq:   'Get key at https://console.groq.com/keys then add: GROQ_API_KEY=your_key to .env',
    },
  };

  // Quick connectivity test for enabled providers
  const tests = {};
  for (const p of PROVIDERS.filter(p => p.enabled)) {
    try {
      if (p.id === 'gemini') {
        await axios.get(
          'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY,
          { timeout: 5000 }
        );
        tests[p.id] = '✅ API key valid and reachable';
      } else if (p.id === 'groq') {
        await axios.get('https://api.groq.com/openai/v1/models', {
          timeout: 5000,
          headers: { Authorization: 'Bearer ' + process.env.GROQ_API_KEY },
        });
        tests[p.id] = '✅ API key valid and reachable';
      } else if (p.id === 'claude') {
        // Claude doesn't have a free models endpoint — just check key format
        tests[p.id] = process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-')
          ? '✅ Key format looks correct'
          : '⚠️ Key should start with sk-ant-';
      } else if (p.id === 'openai') {
        await axios.get('https://api.openai.com/v1/models', {
          timeout: 5000,
          headers: { Authorization: 'Bearer ' + process.env.OPENAI_API_KEY },
        });
        tests[p.id] = '✅ API key valid and reachable';
      }
    } catch (err) {
      tests[p.id] = '❌ ' + (err.response?.status
        ? 'HTTP ' + err.response?.status + ' — ' + (err.response?.data?.error?.message || 'check key')
        : err.message);
    }
  }

  results.connectivity_tests = Object.keys(tests).length ? tests : 'No enabled providers to test';
  res.json(results);
});

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/ai/health', (req, res) => {
  const active = PROVIDERS.find(p => p.enabled);
  res.json({
    server:          'ok',
    active_provider: active?.id || 'none',
    providers:       Object.fromEntries(
      PROVIDERS.map(p => [p.id, { enabled: p.enabled, name: p.name }])
    ),
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const active = PROVIDERS.filter(p => p.enabled).map(p => p.name);
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║         ميزان Cloud AI  —  Port ' + PORT + '                 ║');
  console.log('╠══════════════════════════════════════════════════════╣');

  if (active.length > 0) {
    console.log('║  ✅ Active: ' + active.join(', ').padEnd(42) + '║');
  } else {
    console.log('║  ❌ NO PROVIDERS — add a key to .env!               ║');
  }

  console.log('║                                                      ║');
  console.log('║  Health:    http://localhost:' + PORT + '/api/ai/health      ║');
  console.log('║  Diagnose:  http://localhost:' + PORT + '/api/ai/diagnose    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  if (active.length === 0) {
    console.log('  To fix: open .env and add one of:');
    console.log('  GEMINI_API_KEY=...   ← FREE  → https://aistudio.google.com/app/apikey');
    console.log('  GROQ_API_KEY=...     ← FREE  → https://console.groq.com/keys');
    console.log('');
  }

  console.log('  Keys loaded from .env:');
  console.log('  GEMINI_API_KEY:    ', process.env.GEMINI_API_KEY    ? '✅ present' : '❌ missing');
  console.log('  GROQ_API_KEY:      ', process.env.GROQ_API_KEY      ? '✅ present' : '❌ missing');
  console.log('  ANTHROPIC_API_KEY: ', process.env.ANTHROPIC_API_KEY ? '✅ present' : '❌ missing');
  console.log('  OPENAI_API_KEY:    ', process.env.OPENAI_API_KEY    ? '✅ present' : '❌ missing');
  console.log('');
});