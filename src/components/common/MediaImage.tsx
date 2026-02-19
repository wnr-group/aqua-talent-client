import { useMediaUrl } from '@/services/media'

interface MediaImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallback?: React.ReactNode
}

/**
 * Image component that resolves S3 keys to presigned URLs
 */
export default function MediaImage({ src, alt, className = '', fallback = null }: MediaImageProps) {
  const resolvedUrl = useMediaUrl(src)

  if (!resolvedUrl) {
    return <>{fallback}</>
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  )
}
