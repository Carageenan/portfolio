// Project untuk halaman Projects (mode profesional).
// link: isi URL kalau sudah online / repo publik. Kosongkan kalau belum.

export const projects = [
  {
    id: 'iip-jaya-meat',
    name: 'IIP JAYA MEAT',
    stack: ['React', 'Tailwind', 'Supabase'],
    desc: {
      id: 'Website company profile untuk usaha daging keluarga, dengan panel admin ber-login untuk mengatur stok dan harga.',
      en: "Company profile site for my family's meat business, with a login-protected admin panel to manage stock and prices.",
    },
    link: '',
  },
  {
    id: 'dailylog',
    name: 'DailyLog',
    stack: ['Next.js', 'Supabase', 'Vercel'],
    desc: {
      id: 'Pencatat aktivitas harian mobile-first yang bikin isi timesheet bulanan jadi cepat.',
      en: 'A mobile-first daily activity tracker that makes filling the monthly timesheet quick.',
    },
    link: '',
  },
  {
    id: 'arb-bot',
    name: 'Crypto arbitrage bot',
    stack: ['Python', 'ccxt'],
    desc: {
      id: 'Bot arbitrase triangular yang memantau market dan menguji strategi lewat paper trading.',
      en: 'A triangular arbitrage bot that watches the market and tests strategies with paper trading.',
    },
    link: '',
  },
  {
    id: 'portfolio',
    name: 'This portfolio',
    stack: ['React', 'Three.js', 'React Three Fiber'],
    desc: {
      id: 'Website ini sendiri: dunia 3D yang bisa dijelajahi naik motor.',
      en: 'This site: a 3D world you can explore on a motorcycle.',
    },
    link: 'https://github.com/carageenan/portfolio',
  },
]

export const links = {
  github: 'https://github.com/carageenan',
  linkedin: '', // TODO: isi URL LinkedIn
}
