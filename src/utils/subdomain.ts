// Subdomain detection and routing utility
// Students use main domain, Company and Admin use subdomains
// For Vercel free tier (no custom domain), use VITE_PORTAL_TYPE env var

export type PortalType = 'public' | 'company' | 'admin'

export function getSubdomain(): string | null {
  const hostname = window.location.hostname

  // Extract subdomain from hostname
  // Works for both production (admin.aquatalent.com) and local (admin.aquatalent.local)
  const parts = hostname.split('.')

  // Need at least 3 parts for a subdomain (e.g., admin.aquatalent.local or admin.aquatalent.com)
  if (parts.length >= 3) {
    const subdomain = parts[0] || ''
    // Only company and admin use subdomains
    if (['company', 'admin'].includes(subdomain)) {
      return subdomain
    }
  }

  return null // public/main domain (includes student portal)
}

export function getPortalType(): PortalType {
  // Check for environment variable first (for Vercel deployments without custom domain)
  const envPortal = import.meta.env.VITE_PORTAL_TYPE as string | undefined
  if (envPortal && ['public', 'company', 'admin'].includes(envPortal)) {
    return envPortal as PortalType
  }

  // Fall back to subdomain detection
  const subdomain = getSubdomain()

  switch (subdomain) {
    case 'company':
      return 'company'
    case 'admin':
      return 'admin'
    default:
      return 'public'
  }
}

export function getPortalBaseUrl(portal: PortalType | 'student'): string {
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  const port = window.location.port

  // Extract base domain (removes subdomain if present)
  const parts = hostname.split('.')
  let baseDomain: string

  if (parts.length >= 3 && ['company', 'admin'].includes(parts[0] || '')) {
    // Has a portal subdomain, get the base domain
    baseDomain = parts.slice(1).join('.')
  } else {
    // No subdomain or unknown subdomain
    baseDomain = hostname
  }

  // Build URL with subdomain
  const portSuffix = port ? `:${port}` : ''

  switch (portal) {
    case 'company':
      return `${protocol}//company.${baseDomain}${portSuffix}`
    case 'admin':
      return `${protocol}//admin.${baseDomain}${portSuffix}`
    case 'student':
    default:
      // Students and public use main domain
      return `${protocol}//${baseDomain}${portSuffix}`
  }
}

// Get the main/public site URL
export function getMainSiteUrl(): string {
  return getPortalBaseUrl('public')
}

// Check if currently on a specific portal
export function isOnPortal(portal: PortalType): boolean {
  return getPortalType() === portal
}
