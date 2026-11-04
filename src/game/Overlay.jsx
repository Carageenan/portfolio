import { useEffect, useRef, useState } from 'react'
import { stories } from '../content/stories'
import { useLang } from '../i18n'
import { bike, ui, emit, subscribe, teleport, MAP_HALF } from './state'
import { input, setJoystick } from './input'

function useUi() {
  const [, force] = useState(0)
  useEffect(() => subscribe(() => force((n) => n + 1)), [])
  return ui
}

const isTouch = () => typeof window !== 'undefined' && matchMedia('(pointer: coarse)').matches

function Minimap() {
  const ref = useRef()
  useEffect(() => {
    let raf
    const c = ref.current
    const ctx = c.getContext('2d')
    const S = c.width
    const k = S / (MAP_HALF * 2)
    const draw = () => {
      ctx.clearRect(0, 0, S, S)
      ctx.fillStyle = 'rgba(143,191,106,0.92)'
      ctx.fillRect(0, 0, S, S)
      for (const s of stories) {
        const x = (s.pos[0] + MAP_HALF) * k
        const y = (s.pos[1] + MAP_HALF) * k
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fillStyle = ui.visited.has(s.id) ? '#9a9a8a' : s.color
        ctx.fill()
        ctx.lineWidth = 1.5
        ctx.strokeStyle = '#fff'
        ctx.stroke()
      }
      const bx = (bike.x + MAP_HALF) * k
      const by = (bike.z + MAP_HALF) * k
      ctx.save()
      ctx.translate(bx, by)
      ctx.rotate(-bike.heading + Math.PI)
      ctx.beginPath()
      ctx.moveTo(0, -7)
      ctx.lineTo(5, 5)
      ctx.lineTo(-5, 5)
      ctx.closePath()
      ctx.fillStyle = '#111'
      ctx.fill()
      ctx.restore()
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} className="minimap" width={140} height={140} aria-hidden="true" />
}

function Joystick() {
  const base = useRef()
  const [knob, setKnob] = useState([0, 0])
  const id = useRef(null)
  const R = 46
  const move = (e) => {
    const b = base.current.getBoundingClientRect()
    let dx = e.clientX - (b.left + b.width / 2)
    let dy = e.clientY - (b.top + b.height / 2)
    const d = Math.hypot(dx, dy)
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R }
    setKnob([dx, dy])
    setJoystick(dx / R, dy / R)
  }
  const end = () => {
    id.current = null
    setKnob([0, 0])
    setJoystick(0, 0)
  }
  return (
    <div
      ref={base}
      className="joystick"
      onPointerDown={(e) => { id.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); move(e) }}
      onPointerMove={(e) => id.current === e.pointerId && move(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="joystick-knob" style={{ transform: `translate(${knob[0]}px, ${knob[1]}px)` }} />
    </div>
  )
}

function StoryPanel({ story, onClose }) {
  const { t, pick } = useLang()
  const closeRef = useRef()
  useEffect(() => {
    closeRef.current?.focus()
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="panel-backdrop" onClick={onClose}>
      <article
        className="story-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-title"
        style={{ '--c': story.color }}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <span className="story-year">{pick(story.year)}</span>
          <h2 id="story-title">{pick(story.title)}</h2>
        </header>
        {story.draft && <p className="draft-tag">{t('draft')}</p>}
        <p>{pick(story.body)}</p>
        {story.photos.length > 0 && (
          <div className="photos">
            {story.photos.map((p) => (
              <img key={p.src} src={p.src} alt={pick(p.alt) || ''} loading="lazy" />
            ))}
          </div>
        )}
        <button ref={closeRef} className="btn" onClick={onClose}>{t('close')}</button>
      </article>
    </div>
  )
}

export default function Overlay({ onSkip }) {
  const { t, pick } = useLang()
  const state = useUi()
  const [open, setOpen] = useState(null)
  const [listOpen, setListOpen] = useState(false)
  const touch = isTouch()

  useEffect(() => {
    const h = (e) => setOpen(e.detail)
    window.addEventListener('open-story', h)
    return () => window.removeEventListener('open-story', h)
  }, [])

  useEffect(() => {
    if (open && !ui.visited.has(open)) {
      ui.visited.add(open)
      try { localStorage.setItem('visited', JSON.stringify([...ui.visited])) } catch {}
      emit()
    }
  }, [open])

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem('visited') || '[]')
      v.forEach((id) => ui.visited.add(id))
      emit()
    } catch {}
  }, [])

  const story = stories.find((s) => s.id === open)
  const near = stories.find((s) => s.id === state.nearby)

  return (
    <div className="overlay">
      <div className="hud-top">
        <div className="progress">
          <strong>{state.visited.size}/{stories.length}</strong> {t('found')}
        </div>
        <button className="btn ghost" onClick={() => setListOpen((v) => !v)} aria-expanded={listOpen}>
          {t('list')}
        </button>
        <button className="btn ghost" onClick={onSkip}>{t('skip')}</button>
      </div>

      {listOpen && (
        <ul className="story-list">
          {stories.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => { teleport.target = s.id; setListOpen(false) }}
                style={{ '--c': s.color }}
              >
                <span className="dot" />
                {pick(s.title)}
                {state.visited.has(s.id) && <span className="check" aria-label="visited">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Minimap />

      {near && !open && (
        <button className="prompt" style={{ '--c': near.color }} onClick={() => setOpen(near.id)}>
          <span>{pick(near.title)}</span>
          <small>{t('press')}</small>
        </button>
      )}

      {touch ? (
        <>
          <Joystick />
          <button
            className="boost-btn"
            onPointerDown={() => { input.boost = true }}
            onPointerUp={() => { input.boost = false }}
            onPointerCancel={() => { input.boost = false }}
          >
            ⚡
          </button>
        </>
      ) : (
        <p className="controls-hint">{t('controls')}</p>
      )}

      {story && <StoryPanel story={story} onClose={() => setOpen(null)} />}
    </div>
  )
}
