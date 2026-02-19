import { useState, useEffect } from 'react'
import { api } from './api/client'

interface MediaUrlResponse {
  url: string
}

// Cache for presigned URLs (1 hour expiry, we refresh at 50 minutes)
const urlCache = new Map<string, { url: string; expiresAt: number }>()
const CACHE_DURATION_MS = 50 * 60 * 1000 // 50 minutes

/**
 * Fetch a presigned URL for an S3 key
 */
export const getMediaUrl = async (key: string | null | undefined): Promise<string | null> => {
  if (!key) return null

  // Check cache first
  const cached = urlCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url
  }

  try {
    const response = await api.get<MediaUrlResponse>('/media/url', { key })
    const url = response.url

    // Cache the URL
    urlCache.set(key, {
      url,
      expiresAt: Date.now() + CACHE_DURATION_MS,
    })

    return url
  } catch (error) {
    console.error('Failed to fetch media URL:', error)
    return null
  }
}

/**
 * Hook to fetch a presigned URL for an S3 key
 */
export const useMediaUrl = (key: string | null | undefined): string | null => {
  const [url, setUrl] = useState<string | null>(() => {
    // Check cache synchronously for initial render
    if (!key) return null
    const cached = urlCache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.url
    }
    return null
  })

  useEffect(() => {
    if (!key) {
      setUrl(null)
      return
    }

    // Check cache first
    const cached = urlCache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      setUrl(cached.url)
      return
    }

    // Fetch the URL
    let cancelled = false
    getMediaUrl(key).then((fetchedUrl) => {
      if (!cancelled) {
        setUrl(fetchedUrl)
      }
    })

    return () => {
      cancelled = true
    }
  }, [key])

  return url
}

/**
 * Clear the URL cache (useful for testing or logout)
 */
export const clearMediaCache = (): void => {
  urlCache.clear()
}
