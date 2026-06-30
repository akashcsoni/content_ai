const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export function resolveUploadUrl(path: string | null | undefined): string | null {
  const value = path?.trim()
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value

  const normalizedPath = value.startsWith('/') ? value : `/${value}`

  if (API_BASE.startsWith('http')) {
    const origin = API_BASE.replace(/\/api$/, '')
    return `${origin}${normalizedPath}`
  }

  return normalizedPath
}
