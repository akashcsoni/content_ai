import { useId, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperclip, faXmark } from '@fortawesome/free-solid-svg-icons'
import {
  SUPPORT_ATTACHMENT_ACCEPT,
  SUPPORT_ATTACHMENT_MAX_FILES,
  formatAttachmentSize,
} from '../lib/supportAttachments'

type SupportAttachmentFieldProps = {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
  id?: string
}

export default function SupportAttachmentField({
  files,
  onChange,
  disabled = false,
  id,
}: SupportAttachmentFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (selected.length === 0) return

    const merged = [...files]
    for (const file of selected) {
      if (merged.length >= SUPPORT_ATTACHMENT_MAX_FILES) break
      if (!merged.some((existing) => existing.name === file.name && existing.size === file.size)) {
        merged.push(file)
      }
    }

    onChange(merged.slice(0, SUPPORT_ATTACHMENT_MAX_FILES))
  }

  function removeFile(index: number) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index))
  }

  return (
    <div className="account-support-attachments">
      <div className="account-support-attachments-head">
        <label htmlFor={inputId} className="account-support-attachments-label">
          Attachments <span>(optional)</span>
        </label>
        <button
          type="button"
          className="account-support-attachments-add"
          disabled={disabled || files.length >= SUPPORT_ATTACHMENT_MAX_FILES}
          onClick={() => inputRef.current?.click()}
        >
          <FontAwesomeIcon icon={faPaperclip} aria-hidden="true" />
          Add files
        </button>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="account-support-attachments-input"
        accept={SUPPORT_ATTACHMENT_ACCEPT}
        multiple
        disabled={disabled || files.length >= SUPPORT_ATTACHMENT_MAX_FILES}
        onChange={handleSelect}
      />

      <p className="account-support-attachments-hint">
        Up to {SUPPORT_ATTACHMENT_MAX_FILES} files, 5 MB each. Images, PDF, TXT, or CSV.
      </p>

      {files.length > 0 ? (
        <ul className="account-support-attachments-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`}>
              <span className="account-support-attachments-file">
                <FontAwesomeIcon icon={faPaperclip} aria-hidden="true" />
                <span>
                  <strong>{file.name}</strong>
                  <em>{formatAttachmentSize(file.size)}</em>
                </span>
              </span>
              <button
                type="button"
                className="account-support-attachments-remove"
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
              >
                <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
