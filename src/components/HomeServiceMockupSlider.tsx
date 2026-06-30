import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { getHomeMockupSlides, getHomeMockupTabLabel } from '../data/homeServiceMockups'
import { liveServices } from '../data/services'

const ROTATE_MS = 5500

export default function HomeServiceMockupSlider() {
  const services = useMemo(() => liveServices.slice(0, 3), [])
  const slides = useMemo(() => getHomeMockupSlides(services), [services])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null

  const activeSlide = slides[activeIndex]

  return (
    <div className="home-hero-visual">
      <div
        className="home-mockup-slider"
        aria-live="polite"
        aria-label={`${activeSlide.windowTitle} preview`}
      >
        {slides.map((slide, index) => (
          <article
            key={slide.serviceId}
            id={`home-mockup-${slide.serviceId}`}
            className={`home-mockup home-mockup-slide${index === activeIndex ? ' is-active' : ''}`}
            aria-hidden={index !== activeIndex}
          >
            <div className="home-mockup-top">
              <span className="home-mockup-dot home-mockup-dot--red" />
              <span className="home-mockup-dot home-mockup-dot--yellow" />
              <span className="home-mockup-dot home-mockup-dot--green" />
              <span className="home-mockup-title">{slide.windowTitle}</span>
            </div>
            <div className="home-mockup-body">
              <div className="home-mockup-row">
                <span className="home-mockup-label">Status</span>
                <span className="home-mockup-pill home-mockup-pill--success">{slide.statusText}</span>
              </div>
              <div className="home-mockup-field">
                <span className="home-mockup-label">{slide.primaryField.label}</span>
                <p>{slide.primaryField.value}</p>
              </div>
              <div className="home-mockup-field">
                <span className="home-mockup-label">{slide.secondaryField.label}</span>
                <ul>
                  {slide.secondaryField.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="home-mockup-progress">
                <div
                  className="home-mockup-progress-bar"
                  style={{ '--mockup-progress': slide.progressPercent } as CSSProperties}
                />
                <span>
                  {slide.progressLabel} {slide.progressPercent}%
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {slides.length > 1 ? (
        <div className="home-mockup-controls" role="tablist" aria-label="Active services preview">
          {services.map((service, index) => (
            <button
              key={service.id}
              type="button"
              role="tab"
              className={`home-mockup-tab${index === activeIndex ? ' is-active' : ''}`}
              aria-selected={index === activeIndex}
              aria-controls={`home-mockup-${service.id}`}
              onClick={() => setActiveIndex(index)}
            >
              {getHomeMockupTabLabel(service)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
