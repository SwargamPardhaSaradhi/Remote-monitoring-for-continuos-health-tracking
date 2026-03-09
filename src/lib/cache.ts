// LocalStorage Cache Utility
// Caches Supabase data to avoid unnecessary refetching.
// Default TTL: 5 minutes.

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = 'hm_cache_';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Get cached data from localStorage.
 * Returns the data if it exists and hasn't expired, otherwise null.
 */
export function getCache<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): T | null {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;

        const entry: CacheEntry<T> = JSON.parse(raw);
        const age = Date.now() - entry.timestamp;

        if (age > ttlMs) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }

        return entry.data;
    } catch {
        return null;
    }
}

/**
 * Store data in the localStorage cache with the current timestamp.
 */
export function setCache<T>(key: string, data: T): void {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
        // localStorage might be full or unavailable — silently ignore
    }
}

/**
 * Remove specific cache entries by their keys.
 */
export function invalidateCache(...keys: string[]): void {
    for (const key of keys) {
        localStorage.removeItem(CACHE_PREFIX + key);
    }
}

/**
 * Remove all cache entries whose key starts with the given prefix.
 * Useful for bulk-invalidating related caches (e.g. all health_metrics caches).
 */
export function invalidateCacheByPrefix(prefix: string): void {
    const fullPrefix = CACHE_PREFIX + prefix;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(fullPrefix)) {
            keysToRemove.push(key);
        }
    }

    for (const key of keysToRemove) {
        localStorage.removeItem(key);
    }
}
