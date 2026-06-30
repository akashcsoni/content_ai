export const SUPPORT_ATTACHMENT_MAX_FILES = 5
export const SUPPORT_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024
export const SUPPORT_ATTACHMENT_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/csv,.pdf,.txt,.csv'

export function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function openSupportAttachment(input: {
  ticketId: string
  attachmentId: string
  token: string
  fileName: string
  mimeType: string
}): Promise<void> {
  const response = await fetch(
    `${API_BASE}/support/tickets/${input.ticketId}/attachments/${input.attachmentId}`,
    {
      headers: {
        Authorization: `Bearer ${input.token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to open attachment')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = input.fileName
  if (input.mimeType.startsWith('image/') || input.mimeType === 'application/pdf') {
    link.target = '_blank'
    link.rel = 'noreferrer'
  }
  link.click()
  URL.revokeObjectURL(url)
}

export function appendSupportAttachments(formData: FormData, files: File[]): void {
  for (const file of files) {
    formData.append('attachments', file)
  }
}

export function validateSupportAttachmentFiles(files: File[]): string | null {
  if (files.length > SUPPORT_ATTACHMENT_MAX_FILES) {
    return `You can attach up to ${SUPPORT_ATTACHMENT_MAX_FILES} files per message`
  }

  for (const file of files) {
    if (file.size > SUPPORT_ATTACHMENT_MAX_BYTES) {
      return `"${file.name}" is too large. Max file size is 5 MB.`
    }
  }

  return null
}
