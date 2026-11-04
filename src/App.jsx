import { lazy, Suspense, useEffect, useState } from 'react'
import { useLang } from './i18n'
import { projects, links } from './content/projects'

const Game = lazy(() => import('./game/Game'))
const Overlay = lazy(() => import('./game/Overlay'))

const ROUTES = ['explore', 'projects', 'about', 'contact']

function useRoute() {
  const read = () => {
    const r = location.hash.replace('#/', '')
    return ROUTES.includes(r) ? r : 'explore'
  }
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const h = () => setRoute(read())
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  return [route, (r) => (location.hash = '/' + r)]
}

function Nav({ route, go }) {
  const { t, lang, setLang } = useLang()
  return (
    <header className={'nav' + (route === 'explore' ? ' on-game' : '')}>
      <a href="#/explore" className="brand" onClick={() => go('explore')}>
        Ihsan<span>.</span>
      </a>
      <nav aria-label="Main">
        {ROUTES.map((r) => (
          <a key={r} href={'#/' + r} aria-current={route === r ? 'page' : undefined}>
            {t(r)}
          </a>
        ))}
      </nav>
      <button
        className="lang"
        onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
        aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      >
        <span className={lang === 'id' ? 'on' : ''}>ID</span>
        <span className={lang === 'en' ? 'on' : ''}>EN</span>
      </button>
    </header>
  )
}

function Projects() {
  const { t, pick } = useLang()
  return (
    <main className="page">
      <h1>{t('projects')}</h1>
      <div className="grid">
        {projects.map((p) => (
          <article key={p.id} className="card">
            <h2>{p.name}</h2>
            <p>{pick(p.desc)}</p>
            <ul className="tags" aria-label={t('stack')}>
              {p.stack.map((s) => <li key={s}>{s}</li>)}
            </ul>
            {p.link ? (
              <a className="btn" href={p.link} target="_blank" rel="noreferrer">{t('view')} →</a>
            ) : (
              <span className="muted">{t('soon')}</span>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}

function About() {
  const { t } = useLang()
  const skills = ['Test automation', 'Mobile & web testing', 'JavaScript / React', 'Python', 'Next.js', 'Supabase']
  return (
    <main className="page narrow">
      <h1>Muhammad Ihsan Erdiansyah</h1>
      <p className="lead">{t('role')}</p>
      <p>{t('aboutText')}</p>
      <h2>{t('skills')}</h2>
      <ul className="tags big">{skills.map((s) => <li key={s}>{s}</li>)}</ul>
    </main>
  )
}

function Contact() {
  const { t } = useLang()
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT
  return (
    <main className="page narrow">
      <h1>{t('contact')}</h1>
      <p>{t('contactText')}</p>
      <ul className="contact-links">
        <li><a href={links.github} target="_blank" rel="noreferrer">GitHub</a></li>
        {links.linkedin && <li><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>}
      </ul>
      {endpoint && (
        <form className="contact-form" action={endpoint} method="POST">
          <label>Email<input type="email" name="email" required /></label>
          <label>Message<textarea name="message" rows="5" required /></label>
          <button className="btn" type="submit">Send</button>
        </form>
      )}
    </main>
  )
}

export default function App() {
  const [route, go] = useRoute()
  const { t } = useLang()
  return (
    <>
      <Nav route={route} go={go} />
      {/* game stays mounted so progress and position survive page switches */}
      <div className="game" hidden={route !== 'explore'}>
        <Suspense fallback={<div className="loading">{t('loading')}</div>}>
          <Game active={route === 'explore'} />
          {route === 'explore' && <Overlay onSkip={() => go('projects')} />}
        </Suspense>
      </div>
      {route === 'projects' && <Projects />}
      {route === 'about' && <About />}
      {route === 'contact' && <Contact />}
    </>
  )
}
