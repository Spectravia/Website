/**
 * Minimal in-memory fixed-window rate limiter, keyed by client IP.
 * Sufficient for a single Node process; swap for a shared store (e.g. Redis
 * via `useStorage`) if the site is ever scaled to multiple instances.
 */
const hits = new Map<string, { count: number, resetAt: number }>()

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    if (hits.size > 10_000) pruneExpired(now)
    return true
  }

  entry.count++
  return entry.count <= max
}

function pruneExpired(now: number) {
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key)
  }
}
