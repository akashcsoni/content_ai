import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faFileLines, faImage } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import type { SupportTicketAttachment } from '../lib/api'
import { formatAttachmentSize, openSupportAttachment } from '../lib/supportAttachments'

type SupportMessageAttachmentsProps = {
  attachments: SupportTicketAttachment[]
  ticketId: string
  token: string | null
}

function attachmentIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return faImage
  return faFileLines
}

export default function SupportMessageAttachments({
  attachments,
  ticketId,
  token,
}: SupportMessageAttachmentsProps) {
  const [openingId, setOpeningId] = useState<string | null>(null)

  if (attachments.length === 0) return null

  async function handleOpen(attachment: SupportTicketAttachment) {
    if (!token) return

    setOpeningId(attachment.id)
    try {
      await openSupportAttachment({
        ticketId,
        attachmentId: attachment.id,
        token,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
      })
    } finally {
      setOpeningId(null)
    }
  }

  return (
    <ul className="account-support-message-attachments">
      {attachments.map((attachment) => (
        <li key={attachment.id}>
          <button
            type="button"
            className="account-support-message-attachment"
            disabled={!token || openingId === attachment.id}
            onClick={() => void handleOpen(attachment)}
          >
            <FontAwesomeIcon icon={attachmentIcon(attachment.mimeType)} aria-hidden="true" />
            <span>
              <strong>{attachment.fileName}</strong>
              <em>{formatAttachmentSize(attachment.fileSize)}</em>
            </span>
            <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )
}
