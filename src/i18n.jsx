import { createContext, useContext, useEffect, useState } from 'react'

const strings = {
  id: {
    explore: 'Jelajah',
    projects: 'Projects',
    about: 'Tentang',
    contact: 'Kontak',
    skip: 'Langsung ke Projects',
    found: 'cerita ditemukan',
    press: 'Tekan E atau tap untuk buka cerita',
    open: 'Buka',
    close: 'Tutup',
    list: 'Daftar cerita',
    draft: 'Draft — belum diisi',
    controls: 'WASD / panah untuk nyetir · Shift ngebut · Space rem',
    controlsTouch: 'Joystick kiri untuk nyetir',
    loading: 'Memanaskan mesin…',
    role: 'QA Automation Engineer',
    aboutText:
      'Halo, saya Ihsan. Sekarang QA Automation Engineer di BNI (tim Maverick), dengan latar belakang software developer. Saya suka bikin tools sendiri untuk masalah sehari-hari, dari bot trading sampai website untuk usaha keluarga.',
    skills: 'Keahlian',
    contactText: 'Mau ngobrol soal kerja sama atau sekadar sapa? Hubungi saya di sini.',
    stack: 'Stack',
    view: 'Lihat',
    soon: 'Segera',
  },
  en: {
    explore: 'Explore',
    projects: 'Projects',
    about: 'About',
    contact: 'Contact',
    skip: 'Skip to Projects',
    found: 'stories found',
    press: 'Press E or tap to open the story',
    open: 'Open',
    close: 'Close',
    list: 'Story list',
    draft: 'Draft — not written yet',
    controls: 'WASD / arrows to ride · Shift boost · Space brake',
    controlsTouch: 'Left joystick to ride',
    loading: 'Warming up the engine…',
    role: 'QA Automation Engineer',
    aboutText:
      "Hi, I'm Ihsan. I'm a QA Automation Engineer at BNI (Maverick team) with a software developer background. I like building my own tools for everyday problems, from trading bots to a website for my family's business.",
    skills: 'Skills',
    contactText: 'Want to work together or just say hi? Reach me here.',
    stack: 'Stack',
    view: 'View',
    soon: 'Soon',
  },
}

const LangCtx = createContext(null)

function initialLang() {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'id' || saved === 'en') return saved
  } catch {}
  return navigator.language?.startsWith('id') ? 'id' : 'en'
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang)
  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem('lang', lang) } catch {}
  }, [lang])
  const t = (k) => strings[lang][k] ?? k
  const pick = (obj) => (obj && typeof obj === 'object' ? obj[lang] ?? obj.id : obj)
  return <LangCtx.Provider value={{ lang, setLang, t, pick }}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)
