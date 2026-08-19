import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sourcePath = process.argv[2]

if (!sourcePath) {
  console.error('Usage: npm run export:transcript -- /absolute/path/to/pi-session.jsonl')
  process.exit(1)
}

const lines = readFileSync(resolve(sourcePath), 'utf8').split('\n').filter(Boolean)
const entries = []

function redact(value) {
  return String(value)
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[已隐藏的会话令牌]')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [已隐藏]')
    .replace(/\bya29\.[A-Za-z0-9._~-]+/g, '[已隐藏的 Google 授权令牌]')
    .replace(/\b(?:sk|ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_-]+\b/g, '[已隐藏的访问令牌]')
    .replace(/((?:token|password|passwd|secret|api[_-]?key)\s*["']?\s*[:=]\s*["'])([^"']+)(["'])/gi, '$1[已隐藏]$3')
}

function addEntry(timestamp, role, kind, content, toolName) {
  const text = redact(content).trim()
  if (!text) return
  entries.push({ timestamp, role, kind, content: text, ...(toolName ? { toolName } : {}) })
}

for (const line of lines) {
  const event = JSON.parse(line)
  if (event.type !== 'message' || !event.message) continue

  const timestamp = event.timestamp || new Date(event.message.timestamp).toISOString()
  const { role, content = [] } = event.message

  if (role === 'user') {
    for (const part of content) {
      if (part.type === 'text') addEntry(timestamp, 'user', 'message', part.text)
      if (part.type === 'image') addEntry(timestamp, 'user', 'attachment', '[图片附件未包含在公开导出中]')
    }
    continue
  }

  if (role === 'assistant') {
    for (const part of content) {
      if (part.type === 'text') addEntry(timestamp, 'assistant', 'message', part.text)
      if (part.type === 'toolCall') {
        const args = JSON.stringify(part.arguments ?? {}, null, 2)
        addEntry(timestamp, 'assistant', 'tool-call', args, part.name || 'tool')
      }
      // Internal thinking is deliberately omitted from the public export.
    }
    continue
  }

  if (role === 'toolResult') {
    const text = content
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n')
    addEntry(timestamp, 'tool', event.message.isError ? 'tool-error' : 'tool-result', text, event.message.toolName || 'tool')
  }
}

const source = {
  sessionId: '20ae29da-0d6f-4feb-b584-9c7eef1bc2b7',
  piSessionId: lines.length ? JSON.parse(lines[0]).id : '',
  exportedAt: new Date().toISOString(),
  entryCount: entries.length,
  entries,
}

const output = `export const qwen38Transcript = ${JSON.stringify(source, null, 2)} as const\n`
writeFileSync(resolve('src/qwen38-transcript.ts'), output)
console.log(`Exported ${entries.length} public entries to src/qwen38-transcript.ts`)
