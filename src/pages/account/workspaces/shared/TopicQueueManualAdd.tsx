import { useState, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

type TopicCategoryOption = {
  id: string
  name: string
}

export type TopicQueueEntry = {
  topic: string
  focusKeyword?: string
}

type TopicQueueManualAddProps = {
  topic: string
  onTopicChange: (value: string) => void
  focusKeyword?: string
  onFocusKeywordChange?: (value: string) => void
  showFocusKeyword?: boolean
  categoryId: string
  onCategoryChange: (value: string) => void
  categories: TopicCategoryOption[]
  onAddTopics: (entries: TopicQueueEntry[]) => void | Promise<void>
  submitting?: boolean
  platformSlot?: ReactNode
  placeholder?: string
  focusKeywordPlaceholder?: string
}

function parseBulkLine(line: string, parseFocusKeyword: boolean): TopicQueueEntry {
  const trimmed = line.trim()
  if (!trimmed) {
    return { topic: '' }
  }

  if (!parseFocusKeyword) {
    return { topic: trimmed }
  }

  const pipeIndex = trimmed.indexOf('|')
  if (pipeIndex === -1) {
    return { topic: trimmed }
  }

  const topic = trimmed.slice(0, pipeIndex).trim()
  const focusKeyword = trimmed.slice(pipeIndex + 1).trim()
  return {
    topic,
    focusKeyword: focusKeyword || undefined,
  }
}

function collectTopicEntries(
  singleTopic: string,
  singleFocusKeyword: string,
  bulkTopics: string,
  showBulk: boolean,
  parseFocusKeyword: boolean,
): TopicQueueEntry[] {
  const seen = new Set<string>()
  const result: TopicQueueEntry[] = []

  const add = (entry: TopicQueueEntry) => {
    const topic = entry.topic.trim()
    if (!topic) return
    const key = topic.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    result.push({
      topic,
      focusKeyword: entry.focusKeyword?.trim() || undefined,
    })
  }

  if (singleTopic.trim()) {
    add({
      topic: singleTopic,
      focusKeyword: parseFocusKeyword ? singleFocusKeyword : undefined,
    })
  }

  if (showBulk) {
    for (const line of bulkTopics.split('\n')) {
      add(parseBulkLine(line, parseFocusKeyword))
    }
  }

  return result
}

export default function TopicQueueManualAdd({
  topic,
  onTopicChange,
  focusKeyword = '',
  onFocusKeywordChange,
  showFocusKeyword = false,
  categoryId,
  onCategoryChange,
  categories,
  onAddTopics,
  submitting = false,
  platformSlot,
  placeholder = 'e.g. How to improve SEO for local businesses',
  focusKeywordPlaceholder = 'e.g. local seo tips',
}: TopicQueueManualAddProps) {
  const [showBulk, setShowBulk] = useState(false)
  const [bulkTopics, setBulkTopics] = useState('')

  const entriesToAdd = collectTopicEntries(
    topic,
    focusKeyword,
    bulkTopics,
    showBulk,
    showFocusKeyword,
  )
  const canSubmit = entriesToAdd.length > 0

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || submitting) return

    await onAddTopics(entriesToAdd)
    onTopicChange('')
    onFocusKeywordChange?.('')
    setBulkTopics('')
    setShowBulk(false)
  }

  return (
    <div className="service-topics-manual-add">
      <div className="service-topics-manual-add-head">
        <h3>Add topics manually</h3>
        <p>
          Queue your own ideas without AI. Add one topic at a time or paste several lines to batch
          add.
          {showFocusKeyword
            ? ' Optionally set a focus keyword — the main SEO phrase you want to rank for (like ContentBot).'
            : null}
        </p>
      </div>

      <form className="service-topics-manual-add-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="service-topics-add-row">
          <label className="service-topics-manual-field service-topics-manual-field--grow">
            <span>Topic</span>
            <input
              type="text"
              value={topic}
              placeholder={placeholder}
              disabled={submitting}
              onChange={(event) => onTopicChange(event.target.value)}
            />
          </label>

          {showFocusKeyword && onFocusKeywordChange ? (
            <label className="service-topics-manual-field service-topics-manual-field--grow">
              <span>Focus keyword</span>
              <input
                type="text"
                value={focusKeyword}
                placeholder={focusKeywordPlaceholder}
                disabled={submitting}
                onChange={(event) => onFocusKeywordChange(event.target.value)}
              />
            </label>
          ) : null}

          <label className="service-topics-manual-field">
            <span>Category</span>
            <select
              value={categoryId}
              disabled={submitting}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          {platformSlot}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit || submitting}
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
            {submitting
              ? 'Adding...'
              : entriesToAdd.length > 1
                ? `Add ${entriesToAdd.length} topics`
                : 'Add to queue'}
          </button>
        </div>

        <div className="service-topics-manual-add-bulk-toggle">
          <button
            type="button"
            className="service-topics-manual-add-bulk-btn"
            onClick={() => setShowBulk((current) => !current)}
          >
            {showBulk ? 'Hide bulk add' : 'Add multiple topics'}
          </button>
        </div>

        {showBulk && (
          <label className="service-topics-manual-field service-topics-manual-field--full">
            <span>Topics (one per line)</span>
            <textarea
              rows={4}
              value={bulkTopics}
              placeholder={
                showFocusKeyword
                  ? 'Topic title | focus keyword\nAnother topic | another keyword'
                  : 'Topic one\nTopic two\nTopic three'
              }
              disabled={submitting}
              onChange={(event) => setBulkTopics(event.target.value)}
            />
          </label>
        )}

        {showBulk && collectTopicEntries('', '', bulkTopics, true, showFocusKeyword).length > 0 ? (
          <p className="service-topics-manual-add-hint">
            {collectTopicEntries(topic, focusKeyword, bulkTopics, true, showFocusKeyword).length}{' '}
            unique topic
            {collectTopicEntries(topic, focusKeyword, bulkTopics, true, showFocusKeyword).length === 1
              ? ''
              : 's'}{' '}
            ready to add.
          </p>
        ) : null}
      </form>
    </div>
  )
}
