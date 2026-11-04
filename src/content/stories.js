// Cerita personal yang muncul di map. Edit teks di sini.
// pos = [x, z] di map (map dari -60 sampai 60).
// photos = path gambar di /public/photos (opsional, nanti diisi).
// draft: true = teks masih placeholder, belum diisi Ihsan.

export const stories = [
  {
    id: 'sma',
    pos: [-34, -30],
    color: '#e76f51',
    kind: 'school',
    draft: true,
    title: { id: 'Masa SMA', en: 'High school' },
    year: '—',
    body: {
      id: 'Tulis cerita SMA kamu di sini: sekolah di mana, momen yang paling diingat, kenapa mulai tertarik ke dunia komputer.',
      en: 'Your high school story goes here: where you studied, the moment you remember most, how you got into computers.',
    },
    photos: [],
  },
  {
    id: 'kuliah',
    pos: [30, -34],
    color: '#2a9d8f',
    kind: 'campus',
    draft: true,
    title: { id: 'Kuliah', en: 'College' },
    year: '—',
    body: {
      id: 'Tulis cerita kuliah: kampus, jurusan, project pertama, teman-teman.',
      en: 'Your college story: campus, major, first project, friends.',
    },
    photos: [],
  },
  {
    id: 'developer',
    pos: [-40, 12],
    color: '#8e7dbe',
    kind: 'studio',
    draft: true,
    title: { id: 'Jadi developer', en: 'Becoming a developer' },
    year: '—',
    body: {
      id: 'Awal karier sebagai software developer. Di sini juga cerita iseng bikin trading bot sendiri.',
      en: 'Starting out as a software developer — and the side quest of building my own trading bots.',
    },
    photos: [],
  },
  {
    id: 'qa',
    pos: [38, 14],
    color: '#f4a261',
    kind: 'office',
    draft: false,
    title: { id: 'QA Automation di BNI', en: 'QA Automation at BNI' },
    year: { id: 'Sekarang', en: 'Now' },
    body: {
      id: 'Sekarang saya QA Automation Engineer di BNI, tim Maverick. Kerjaan saya ngetes aplikasi mobile dan web, dan bikin test otomatis biar rilis lebih aman.',
      en: "I'm a QA Automation Engineer at BNI on the Maverick team. I test mobile and web apps and build automated tests so releases ship safely.",
    },
    photos: [],
  },
  {
    id: 'side',
    pos: [0, 40],
    color: '#c1121f',
    kind: 'shop',
    draft: false,
    title: { id: 'Side project', en: 'Side projects' },
    year: '—',
    body: {
      id: 'Di luar kantor saya suka bikin tools sendiri: website buat usaha daging keluarga (IIP JAYA MEAT) dan DailyLog, pencatat aktivitas harian. Detailnya ada di menu Projects.',
      en: 'Outside work I build my own tools: a website for my family\'s meat business (IIP JAYA MEAT) and DailyLog, a daily activity tracker. Details are in Projects.',
    },
    photos: [],
  },
  {
    id: 'trip',
    pos: [4, -6],
    color: '#457b9d',
    kind: 'viewpoint',
    draft: true,
    title: { id: 'Perjalanan', en: 'Journeys' },
    year: '—',
    body: {
      id: 'Foto-foto perjalanan dari Instagram. Tambahkan foto ke /public/photos lalu daftarkan di sini.',
      en: 'Trips and moments from my Instagram. Add photos to /public/photos and list them here.',
    },
    photos: [],
  },
]
