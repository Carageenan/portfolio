import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

// Low-poly buildings, one style per story "kind".

function Box({ p, s, c, r = 0.8 }) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={r} />
    </mesh>
  )
}

function Roof({ p, w, d, h, c }) {
  return (
    <mesh position={p} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[Math.max(w, d) * 0.75, h, 4]} />
      <meshStandardMaterial color={c} roughness={0.7} />
    </mesh>
  )
}

function Windows({ y, w, z, n, c = '#cfe8ff' }) {
  return Array.from({ length: n }, (_, i) => (
    <mesh key={i} position={[-w / 2 + (w / (n + 1)) * (i + 1), y, z]}>
      <boxGeometry args={[0.7, 0.7, 0.05]} />
      <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.15} />
    </mesh>
  ))
}

const builders = {
  school: (c) => (
    <>
      <Box p={[0, 1.6, 0]} s={[8, 3.2, 4]} c="#f2e8cf" />
      <Box p={[0, 3.5, 0]} s={[8.4, 0.5, 4.4]} c={c} />
      <Windows y={1.8} w={8} z={2.03} n={5} />
      <Box p={[-5, 2.4, 2]} s={[0.12, 4.8, 0.12]} c="#888" />
      <Box p={[-4.55, 4.4, 2]} s={[0.8, 0.5, 0.04]} c="#e63946" />
      <Box p={[-4.55, 4.0, 2]} s={[0.8, 0.4, 0.04]} c="#ffffff" />
    </>
  ),
  campus: (c) => (
    <>
      <Box p={[0, 2.5, 0]} s={[7, 5, 5]} c="#e9edc9" />
      <Box p={[0, 5.3, 0]} s={[7.6, 0.6, 5.6]} c={c} />
      {[-2.4, -0.8, 0.8, 2.4].map((x) => (
        <Box key={x} p={[x, 2.2, 2.9]} s={[0.4, 4.4, 0.4]} c="#fefae0" />
      ))}
      <Windows y={3.6} w={7} z={2.53} n={4} />
    </>
  ),
  studio: (c) => (
    <>
      <Box p={[0, 1.5, 0]} s={[5, 3, 5]} c="#dfe7fd" />
      <Box p={[0, 3.2, 0]} s={[5.2, 0.4, 5.2]} c={c} />
      <Box p={[0, 1.5, 2.53]} s={[3, 1.6, 0.06]} c="#0b132b" r={0.2} />
      <Box p={[-0.6, 1.7, 2.58]} s={[1.2, 0.08, 0.02]} c="#5bc0be" />
      <Box p={[0.2, 1.45, 2.58]} s={[1.8, 0.08, 0.02]} c="#5bc0be" />
      <Box p={[-0.2, 1.2, 2.58]} s={[1.4, 0.08, 0.02]} c="#f4a261" />
    </>
  ),
  office: (c) => (
    <>
      <Box p={[0, 4, 0]} s={[5, 8, 5]} c="#e5e5e5" r={0.4} />
      {[1.6, 3.2, 4.8, 6.4].map((y) => (
        <Windows key={y} y={y} w={5} z={2.53} n={3} c="#9ec9ff" />
      ))}
      <Box p={[0, 8.2, 0]} s={[5.3, 0.4, 5.3]} c={c} />
      <Box p={[0, 0.6, 2.6]} s={[1.6, 1.2, 0.1]} c="#30475e" />
    </>
  ),
  shop: (c) => (
    <>
      <Box p={[0, 1.4, 0]} s={[6, 2.8, 4]} c="#fff1e6" />
      <Roof p={[0, 3.6, 0]} w={6} d={4} h={1.6} c="#7f5539" />
      {[-2.25, -0.75, 0.75, 2.25].map((x, i) => (
        <Box key={x} p={[x, 2.5, 2.4]} s={[1.5, 0.15, 0.9]} c={i % 2 ? '#ffffff' : c} />
      ))}
      <Box p={[0, 1.1, 2.03]} s={[3.6, 1.2, 0.05]} c="#cdeac0" />
    </>
  ),
  viewpoint: (c) => (
    <>
      <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.6, 0.6, 12]} />
        <meshStandardMaterial color="#d6ccc2" />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2
        return <Box key={i} p={[Math.cos(a) * 2.6, 1.6, Math.sin(a) * 2.6]} s={[0.25, 2.6, 0.25]} c="#6b4f3a" />
      })}
      <mesh position={[0, 3.4, 0]} castShadow>
        <coneGeometry args={[3.4, 1.4, 6]} />
        <meshStandardMaterial color={c} />
      </mesh>
    </>
  ),
}

function Marker({ color, visited }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ref.current.rotation.y = t * 1.2
    ref.current.position.y = 10 + Math.sin(t * 2) * 0.35
  })
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial
        color={visited ? '#b7b7a4' : color}
        emissive={visited ? '#000' : color}
        emissiveIntensity={0.6}
      />
    </mesh>
  )
}

export function Landmark({ story, label, visited, near }) {
  const [x, z] = story.pos
  // buildings face the island centre
  const face = Math.atan2(-x, -z)
  return (
    <group position={[x, 0, z]}>
      <group rotation={[0, face, 0]}>{builders[story.kind](story.color)}</group>
      <Marker color={story.color} visited={visited} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[8.2, 8.6, 48]} />
        <meshBasicMaterial color={story.color} transparent opacity={near ? 0.7 : 0.22} />
      </mesh>
      <Html position={[0, 7.2, 0]} center distanceFactor={28} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className={'world-label' + (near ? ' is-near' : '')} style={{ '--c': story.color }}>
          {label}
        </div>
      </Html>
    </group>
  )
}
