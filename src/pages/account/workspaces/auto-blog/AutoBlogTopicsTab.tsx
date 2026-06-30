import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
  faEye,
  faMagnifyingGlass,
  faPenToSquare,
  faPlus,
  faRotateLeft,
  faSpinner,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import type { Service } from '../../../../data/services'
import { ApiError, autoBlogApi, type AutoBlogPostDetail } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import { formatCreditCostLabel, useServiceCreditCost, useServiceCredits } from '../../../../context/ServiceCreditsContext'
import type { AutoBlogCategory, AutoBlogSettings, AutoBlogTopic } from './autoBlog.types'
import { formatTopicStatus, resolveTopicGenerateCount } from './autoBlog.types'
import AutoBlogPostPreview from './AutoBlogPostPreview'
import ServicePagination from './ServicePagination'
import TopicQueueManualAdd, { type TopicQueueEntry } from '../shared/TopicQueueManualAdd'
import TopicQueueBestResultsTip from '../shared/TopicQueueBestResultsTip'

const TOPIC_PAGE_SIZE = 10

type TopicTab = 'pending' | 'all' | 'used' | 'failed'

const topicTabs: { value: TopicTab; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'all', label: 'All topics' },
  { value: 'used', label: 'Used' },
  { value: 'failed', label: 'Failed' },
]

type AutoBlogTopicsTabProps = {
  service: Service
  settings: AutoBlogSettings | null
  onSettingsSaved: (settings: AutoBlogSettings) => void
}

function formatTopicCreated(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AutoBlogTopicsTab({
  service,
  settings,
  onSettingsSaved,
}: AutoBlogTopicsTabProps) {
  const { user, token, refreshUser } = useAuth()
  const { refreshCreditCosts } = useServiceCredits()
  const creditCost = useServiceCreditCost(service.id)
  const creditCostLabel = formatCreditCostLabel(creditCost)
  const [topics, setTopics] = useState<AutoBlogTopic[]>([])
  const [categories, setCategories] = useState<AutoBlogCategory[]>([])
  const [selectedPost, setSelectedPost] = useState<AutoBlogPostDetail | null>(null)
  const [previewExpanded, setPreviewExpanded] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [topicTab, setTopicTab] = useState<TopicTab>('pending')
  const [topicSearch, setTopicSearch] = useState('')
  const [showTopicFilters, setShowTopicFilters] = useState(false)
  const [topicPage, setTopicPage] = useState(1)
  const [topicTotal, setTopicTotal] = useState(0)
  const [topicPendingCount, setTopicPendingCount] = useState(0)
  const [newTopic, setNewTopic] = useState('')
  const [newFocusKeyword, setNewFocusKeyword] = useState('')
  const [newTopicCategoryId, setNewTopicCategoryId] = useState('')
  const [loading, setLoading] = useState(true)
  const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null)
  const [generatingTopics, setGeneratingTopics] = useState(false)
  const [addingTopics, setAddingTopics] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const hasApiKey = settings?.hasApiKey ?? false
  const isActive = settings?.enabled ?? false
  const hasCredits = (user?.credits ?? 0) >= creditCost

  const loadData = useCallback(async (options?: { status?: TopicTab; page?: number }) => {
    if (!token) return

    const statusFilter = options?.status ?? topicTab
    const page = options?.page ?? topicPage

    setLoading(true)

    try {
      const [topicsResponse, categoriesResponse] = await Promise.all([
        autoBlogApi.listTopics(token, {
          categoryId: selectedCategoryId === 'all' ? undefined : selectedCategoryId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          page,
          pageSize: TOPIC_PAGE_SIZE,
        }),
        autoBlogApi.listCategories(token),
      ])

      setTopics(topicsResponse.topics)
      setTopicTotal(topicsResponse.total)
      setTopicPendingCount(topicsResponse.pendingCount)
      setCategories(categoriesResponse.categories)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load topics')
    } finally {
      setLoading(false)
    }
  }, [token, selectedCategoryId, topicTab, topicPage])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    if (!token) return
    void autoBlogApi.getSettings(token).then((response) => onSettingsSaved(response.settings))
  }, [token, onSettingsSaved])

  const topicBatchCount = resolveTopicGenerateCount(settings?.topic_generate_count)

  const filteredTopics = useMemo(() => {
    const query = topicSearch.trim().toLowerCase()
    if (!query) return topics

    return topics.filter(
      (topic) =>
        topic.topic.toLowerCase().includes(query) ||
        topic.focusKeyword?.toLowerCase().includes(query) ||
        topic.categoryName?.toLowerCase().includes(query) ||
        topic.source.toLowerCase().includes(query),
    )
  }, [topics, topicSearch])

  function flashSuccess(message: string) {
    setSuccess(message)
    window.setTimeout(() => setSuccess(''), 2500)
  }

  async function handleToggleActive() {
    if (!token || !settings) return

    setTogglingActive(true)
    setError('')

    try {
      const response = await autoBlogApi.saveSettings(token, { enabled: !settings.enabled })
      onSettingsSaved(response.settings)
      flashSuccess(response.settings.enabled ? 'Auto blog activated' : 'Auto blog deactivated')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update status')
    } finally {
      setTogglingActive(false)
    }
  }

  async function handleAddTopics(entries: TopicQueueEntry[]) {
    if (!token || entries.length === 0) return

    setAddingTopics(true)
    setError('')

    let added = 0
    let skipped = 0

    try {
      for (const entry of entries) {
        try {
          await autoBlogApi.addTopic(token, {
            topic: entry.topic,
            focusKeyword: entry.focusKeyword?.trim() || null,
            categoryId: newTopicCategoryId || null,
          })
          added += 1
        } catch (err) {
          if (err instanceof ApiError && err.message.includes('already in your pending queue')) {
            skipped += 1
          } else {
            throw err
          }
        }
      }

      setNewTopic('')
      setNewFocusKeyword('')
      await loadData()
      if (added > 0) {
        flashSuccess(
          skipped > 0
            ? `${added} topic${added === 1 ? '' : 's'} added · ${skipped} duplicate${skipped === 1 ? '' : 's'} skipped`
            : `${added} topic${added === 1 ? '' : 's'} added to queue`,
        )
      } else if (skipped > 0) {
        setError('All topics are already in your pending queue')
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to add topic')
    } finally {
      setAddingTopics(false)
    }
  }

  async function handleGenerateTopics() {
    if (!token) return

    setGeneratingTopics(true)
    setError('')

    try {
      // Always read the latest saved batch size from the server before generating.
      const settingsResponse = await autoBlogApi.getSettings(token)
      onSettingsSaved(settingsResponse.settings)
      const batchCount = resolveTopicGenerateCount(
        settingsResponse.settings.topic_generate_count,
      )

      const response = await autoBlogApi.generateTopics(token, {
        categoryId: selectedCategoryId === 'all' ? null : selectedCategoryId,
      })
      await loadData()
      flashSuccess(
        response.added === batchCount
          ? response.message
          : `${response.added} topic${response.added === 1 ? '' : 's'} added (${batchCount} requested in Settings)`,
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to generate topics')
    } finally {
      setGeneratingTopics(false)
    }
  }

  async function handleGenerateFromTopic(topic: AutoBlogTopic) {
    if (!token) return

    setGeneratingTopicId(topic.id)
    setError('')

    try {
      const response = await autoBlogApi.generatePost(token, { topicId: topic.id })
      if (response.failed) {
        setTopicTab('failed')
        setTopicPage(1)
        await loadData({ status: 'failed', page: 1 })
      } else {
        await loadData()
      }
      await refreshUser()
      await refreshCreditCosts()
      if (response.failed) {
        setError(response.message)
        setSelectedPost(response.post)
        setPreviewExpanded(true)
      } else {
        setSelectedPost(response.post)
        setPreviewExpanded(true)
        setError('')
        flashSuccess(response.message)
      }
    } catch (err) {
      setTopicTab('failed')
      setTopicPage(1)
      await loadData({ status: 'failed', page: 1 })
      setError(err instanceof ApiError ? err.message : 'Unable to generate blog post')
    } finally {
      setGeneratingTopicId(null)
    }
  }

  async function handleDeleteTopic(topicId: string) {
    if (!token) return

    setError('')
    try {
      await autoBlogApi.deleteTopic(token, topicId)
      await loadData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to delete topic')
    }
  }

  async function handleResetTopic(topicId: string) {
    if (!token) return

    setError('')
    try {
      await autoBlogApi.resetTopic(token, topicId)
      await loadData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reset topic')
    }
  }

  async function openPost(postId: string) {
    if (!token) return

    try {
      const response = await autoBlogApi.getPost(token, postId)
      setSelectedPost(response.post)
      setPreviewExpanded(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to open blog post')
    }
  }

  const canUseWorkspace = hasApiKey && isActive

  function getCreateBlogDisabledReason(topicId: string): string | undefined {
    if (generatingTopicId === topicId) {
      return 'Generating blog post...'
    }
    if (generatingTopicId) {
      return 'Wait for the current generation to finish'
    }
    if (!hasApiKey) {
      return 'Add your AI API key in Settings'
    }
    if (!isActive) {
      return 'Turn on Auto blog using the switch above'
    }
    if (!hasCredits) {
      return `You need at least ${creditCostLabel} to generate`
    }
    return undefined
  }

  function renderTopicStatus(topic: AutoBlogTopic) {
    if (topic.status === 'used') {
      return (
        <span className="service-logs-status">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
          {formatTopicStatus(topic.status)}
        </span>
      )
    }

    if (topic.status === 'failed') {
      return (
        <span className="service-logs-status">
          <FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" />
          {formatTopicStatus(topic.status)}
        </span>
      )
    }

    return <span className="service-logs-status">{formatTopicStatus(topic.status)}</span>
  }

  function stopRowClick(event: MouseEvent) {
    event.stopPropagation()
  }

  const topicTotalPages = Math.max(1, Math.ceil(topicTotal / TOPIC_PAGE_SIZE))

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <div className="service-title-with-help">
            <h2>Topic queue</h2>
            <TopicQueueBestResultsTip />
          </div>
          <p>Add topics manually or generate them with AI. Create blog posts from pending topics.</p>
        </div>

        <label className="service-active-toggle">
          <span>Auto blog</span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            className={`service-active-switch ${isActive ? 'is-active' : ''}`}
            disabled={!settings || togglingActive}
            onClick={() => void handleToggleActive()}
          >
            <span className="service-active-switch-thumb" />
          </button>
          <span className="service-active-toggle-label">{isActive ? 'Active' : 'Inactive'}</span>
        </label>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}
      {success && <p className="service-workspace-alert service-workspace-alert--success">{success}</p>}

      {!hasApiKey && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Add your AI API key in <strong>Settings</strong> before using topics or generating posts.
        </p>
      )}

      {settings && !settings.enabled && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Auto blog is inactive. Turn it on using the switch above or enable it in Settings.
        </p>
      )}

      {categories.length === 0 && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Create categories with prompts on the <Link to="?tab=categories">Categories tab</Link> before
          generating topics.
        </p>
      )}

      {!hasCredits && canUseWorkspace && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          You need at least {creditCostLabel} to generate a blog post.{' '}
          <Link to="/account/billing">Buy credits</Link>
        </p>
      )}

      <TopicQueueManualAdd
        topic={newTopic}
        onTopicChange={setNewTopic}
        focusKeyword={newFocusKeyword}
        onFocusKeywordChange={setNewFocusKeyword}
        showFocusKeyword
        categoryId={newTopicCategoryId}
        onCategoryChange={setNewTopicCategoryId}
        categories={categories}
        onAddTopics={handleAddTopics}
        submitting={addingTopics}
      />

      <section className="service-logs-panel service-topics-panel" aria-label="Topic queue">
        <nav className="service-logs-tabs" aria-label="Topic filters">
          {topicTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`service-logs-tab${topicTab === tab.value ? ' service-logs-tab--active' : ''}`}
              onClick={() => {
                setTopicTab(tab.value)
                setTopicPage(1)
              }}
            >
              {tab.label}
              {tab.value === 'pending' && topicPendingCount > 0 ? ` (${topicPendingCount})` : ''}
            </button>
          ))}
        </nav>

        <div className="service-logs-toolbar">
          <form
            className="service-logs-search"
            onSubmit={(event) => {
              event.preventDefault()
            }}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <input
              type="search"
              value={topicSearch}
              placeholder="Search topics..."
              aria-label="Search topics"
              onChange={(event) => setTopicSearch(event.target.value)}
            />
          </form>

          <button
            type="button"
            className={`service-logs-filter-btn${showTopicFilters ? ' service-logs-filter-btn--active' : ''}`}
            onClick={() => setShowTopicFilters((current) => !current)}
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
            Filters & AI
          </button>

          <span className="service-logs-count">
            {loading
              ? 'Loading...'
              : `${topicTotal.toLocaleString()} topic${topicTotal === 1 ? '' : 's'} · ${topicPendingCount} pending`}
          </span>
        </div>

        {showTopicFilters && (
          <div className="service-logs-filters">
            <label className="service-logs-filter-field">
              <span>Category</span>
              <select
                value={selectedCategoryId}
                onChange={(event) => {
                  setSelectedCategoryId(event.target.value)
                  setTopicPage(1)
                }}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.pendingTopicCount} pending)
                  </option>
                ))}
              </select>
            </label>

            <p className="service-logs-filter-note">
              Generates <strong>{topicBatchCount}</strong> topics per batch from Settings → Topics
              &amp; niche → AI topics per batch.
            </p>

            <div className="service-logs-filter-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!canUseWorkspace || generatingTopics}
                onClick={() => void handleGenerateTopics()}
              >
                {generatingTopics
                  ? 'Generating...'
                  : `Generate ${topicBatchCount} topics with AI`}
              </button>
            </div>
          </div>
        )}

        <div className="service-logs-body">
          {loading ? (
            <p className="service-logs-loading">Loading topics...</p>
          ) : filteredTopics.length === 0 ? (
            <div className="service-logs-empty">
              <p>No topics found</p>
              <span>
                {topicSearch.trim()
                  ? 'Try a different search or filter.'
                  : 'Add topics manually above or generate them with AI using Filters & AI.'}
              </span>
            </div>
          ) : (
            <div className="service-logs-table-wrap">
              <table className="service-logs-table service-topics-table">
                <thead>
                  <tr>
                    <th scope="col" className="service-logs-col-topic">
                      Topic
                    </th>
                    <th scope="col" className="service-logs-col-category">
                      Category
                    </th>
                    <th scope="col" className="service-logs-col-status">
                      Status
                    </th>
                    <th scope="col" className="service-logs-col-meta">
                      Source
                    </th>
                    <th scope="col" className="service-logs-col-created">
                      Added
                    </th>
                    <th scope="col" className="service-logs-col-actions">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.map((topic) => {
                    const createDisabledReason = getCreateBlogDisabledReason(topic.id)
                    const isCreateDisabled = Boolean(createDisabledReason)

                    return (
                      <tr
                        key={topic.id}
                        className={`service-logs-table-row${
                          topic.status === 'used' || topic.status === 'failed'
                            ? ' service-logs-table-row--muted'
                            : ''
                        }`}
                      >
                        <td>
                          <span className="service-logs-cell-text service-logs-cell-text--strong service-logs-cell-text--truncate">
                            {topic.topic}
                          </span>
                          {topic.focusKeyword ? (
                            <span className="service-logs-cell-meta service-topics-focus-keyword">
                              Focus: {topic.focusKeyword}
                            </span>
                          ) : null}
                          {topic.errorMessage && (
                            <span className="service-logs-cell-error">{topic.errorMessage}</span>
                          )}
                        </td>
                        <td>
                          <span className="service-logs-cell-meta service-logs-cell-text--truncate">
                            {topic.categoryName || '—'}
                          </span>
                        </td>
                        <td>{renderTopicStatus(topic)}</td>
                        <td>
                          <span className="service-logs-cell-meta">
                            {topic.source === 'ai' ? 'AI' : 'Manual'}
                          </span>
                        </td>
                        <td className="service-logs-table-date">{formatTopicCreated(topic.createdAt)}</td>
                        <td>
                          <div className="service-logs-row-actions" onClick={stopRowClick}>
                            {topic.status === 'pending' && (
                              <button
                                type="button"
                                className="service-logs-action-btn service-logs-action-btn--primary"
                                disabled={isCreateDisabled}
                                title={createDisabledReason}
                                onClick={() => void handleGenerateFromTopic(topic)}
                              >
                                <FontAwesomeIcon
                                  icon={generatingTopicId === topic.id ? faSpinner : faPenToSquare}
                                  spin={generatingTopicId === topic.id}
                                  aria-hidden="true"
                                />
                                {generatingTopicId === topic.id ? 'Generating...' : 'Create'}
                              </button>
                            )}
                            {topic.status === 'used' && topic.postId && (
                              <button
                                type="button"
                                className="service-logs-action-btn"
                                onClick={() => void openPost(topic.postId!)}
                              >
                                <FontAwesomeIcon icon={faEye} aria-hidden="true" />
                                View
                              </button>
                            )}
                            {topic.status === 'failed' && (
                              <>
                                {topic.postId && (
                                  <button
                                    type="button"
                                    className="service-logs-action-btn"
                                    onClick={() => void openPost(topic.postId!)}
                                  >
                                    <FontAwesomeIcon icon={faEye} aria-hidden="true" />
                                    View
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="service-logs-action-btn"
                                  onClick={() => void handleResetTopic(topic.id)}
                                >
                                  <FontAwesomeIcon icon={faRotateLeft} aria-hidden="true" />
                                  Reset
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="service-logs-action-btn service-logs-action-btn--icon"
                              title="Delete topic"
                              aria-label="Delete topic"
                              onClick={() => void handleDeleteTopic(topic.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && topicTotalPages > 1 && (
          <ServicePagination
            className="service-logs-footer"
            page={topicPage}
            totalPages={topicTotalPages}
            total={topicTotal}
            label="topics"
            onPrevious={() => setTopicPage((current) => Math.max(1, current - 1))}
            onNext={() => setTopicPage((current) => Math.min(topicTotalPages, current + 1))}
          />
        )}
      </section>

      {selectedPost && (
        <AutoBlogPostPreview
          post={selectedPost}
          expanded={previewExpanded}
          onExpandedChange={setPreviewExpanded}
          onClose={() => {
            setSelectedPost(null)
            setPreviewExpanded(true)
          }}
        />
      )}
    </div>
  )
}
