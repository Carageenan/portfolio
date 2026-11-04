# Ihsan Erdiansyah — Portfolio

Personal portfolio with an explorable 3D world: ride a motorcycle around a small island and find story landmarks. Professional pages (Projects, About, Contact) live in the top nav.

Built with React, Three.js and React Three Fiber.

## Run locally

```bash
npm install
npm run dev
```

## Controls

- Desktop: WASD / arrow keys to ride, Shift to boost, Space to brake, E to open a story
- Mobile: left joystick to ride, ⚡ to boost, tap the prompt to open a story

## Editing content

- Stories on the map: `src/content/stories.js` (title/body in ID and EN, position, colour, building style)
- Photos: put files in `public/photos/` and add `{ src: '/photos/name.jpg', alt: { id: '…', en: '…' } }` to a story's `photos`
- Projects and links: `src/content/projects.js`
- UI text: `src/i18n.jsx`

## Contact form (optional)

Set `VITE_CONTACT_ENDPOINT` to a form service URL (for example Formspree) to show the contact form. Without it, the Contact page shows links only.
