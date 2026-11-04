import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { input } from './input'
import { bike, MAP_HALF } from './state'

// Simple low-poly motorcycle + rider built from primitives (no external assets).

const BODY = '#1d3557'
const ACCENT = '#e63946'
const TIRE = '#1b1b1b'
const METAL = '#9aa0a6'
const SKIN = '#c68e64'
const SHIRT = '#2a9d8f'
const PANTS = '#264653'
const HELMET = '#f1faee'

function Wheel({ z, spinRef }) {
  return (
    <group position={[0, 0.42, z]}>
      <group ref={spinRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.34, 0.11, 8, 18]} />
          <meshStandardMaterial color={TIRE} roughness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 10]} />
          <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.04, 0.6, 0.06]} />
          <meshStandardMaterial color={METAL} />
        </mesh>
      </group>
    </group>
  )
}

function Rider() {
  return (
    <group position={[0, 1.05, -0.15]}>
      {/* torso, leaning forward */}
      <group rotation={[0.35, 0, 0]}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.46, 0.62, 0.28]} />
          <meshStandardMaterial color={SHIRT} />
        </mesh>
        {/* head + helmet */}
        <mesh position={[0, 0.88, 0.04]} castShadow>
          <sphereGeometry args={[0.22, 14, 12]} />
          <meshStandardMaterial color={HELMET} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.86, 0.2]}>
          <boxGeometry args={[0.3, 0.12, 0.06]} />
          <meshStandardMaterial color="#111" roughness={0.2} metalness={0.4} />
        </mesh>
        {/* arms reaching to handlebar */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.28 * s, 0.42, 0.32]} rotation={[1.1, 0, 0]} castShadow>
            <boxGeometry args={[0.13, 0.55, 0.13]} />
            <meshStandardMaterial color={SHIRT} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={'h' + s} position={[0.28 * s, 0.2, 0.62]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        ))}
      </group>
      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.22 * s, 0.02, 0]}>
          <mesh position={[0, 0, 0.18]} rotation={[1.4, 0, 0]} castShadow>
            <boxGeometry args={[0.16, 0.42, 0.16]} />
            <meshStandardMaterial color={PANTS} />
          </mesh>
          <mesh position={[0, -0.3, 0.38]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.15, 0.42, 0.15]} />
            <meshStandardMaterial color={PANTS} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Bike({ colliders }) {
  const root = useRef()
  const lean = useRef()
  const front = useRef()
  const back = useRef()
  const fork = useRef()

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const max = input.boost ? 26 : 16
    const accel = input.boost ? 26 : 16

    // throttle / reverse / drag
    if (input.throttle > 0) bike.speed += accel * input.throttle * dt
    else if (input.throttle < 0) bike.speed += (bike.speed > 0 ? 30 : 10) * input.throttle * dt
    if (input.brake) bike.speed -= Math.sign(bike.speed) * Math.min(Math.abs(bike.speed), 40 * dt)
    bike.speed -= bike.speed * 0.9 * dt * (input.throttle === 0 ? 1.4 : 0.5)
    bike.speed = Math.max(-6, Math.min(max, bike.speed))
    if (Math.abs(bike.speed) < 0.02 && input.throttle === 0) bike.speed = 0

    // steering scales with speed so you can't spin in place
    const grip = Math.min(1, Math.abs(bike.speed) / 5)
    bike.heading += input.steer * 2.2 * grip * Math.sign(bike.speed || 1) * dt

    let nx = bike.x + Math.sin(bike.heading) * bike.speed * dt
    let nz = bike.z + Math.cos(bike.heading) * bike.speed * dt

    // push out of buildings / trees
    for (const c of colliders) {
      const dx = nx - c.x
      const dz = nz - c.z
      const d = Math.hypot(dx, dz)
      const min = c.r + 0.7
      if (d < min && d > 0.0001) {
        nx = c.x + (dx / d) * min
        nz = c.z + (dz / d) * min
        bike.speed *= 0.6
      }
    }

    // stay on the island
    const lim = MAP_HALF - 3
    if (Math.abs(nx) > lim || Math.abs(nz) > lim) bike.speed *= 0.5
    bike.x = Math.max(-lim, Math.min(lim, nx))
    bike.z = Math.max(-lim, Math.min(lim, nz))

    root.current.position.set(bike.x, 0, bike.z)
    root.current.rotation.y = bike.heading

    const targetLean = -input.steer * Math.min(1, Math.abs(bike.speed) / 10) * 0.38
    lean.current.rotation.z += (targetLean - lean.current.rotation.z) * Math.min(1, dt * 8)
    fork.current.rotation.y += (input.steer * 0.35 - fork.current.rotation.y) * Math.min(1, dt * 10)

    const spin = (bike.speed * dt) / 0.42
    front.current.rotation.x += spin
    back.current.rotation.x += spin
  })

  return (
    <group ref={root}>
      <group ref={lean}>
        {/* frame */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <boxGeometry args={[0.32, 0.36, 1.25]} />
          <meshStandardMaterial color={BODY} roughness={0.5} />
        </mesh>
        {/* tank */}
        <mesh position={[0, 0.98, 0.25]} castShadow>
          <boxGeometry args={[0.42, 0.26, 0.6]} />
          <meshStandardMaterial color={ACCENT} roughness={0.3} />
        </mesh>
        {/* seat */}
        <mesh position={[0, 0.95, -0.35]} castShadow>
          <boxGeometry args={[0.36, 0.12, 0.65]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>
        {/* engine */}
        <mesh position={[0, 0.5, 0.05]} castShadow>
          <boxGeometry args={[0.38, 0.32, 0.5]} />
          <meshStandardMaterial color={METAL} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* exhaust */}
        <mesh position={[0.24, 0.45, -0.55]} rotation={[Math.PI / 2 - 0.15, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.75, 8]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.25} />
        </mesh>
        {/* tail light */}
        <mesh position={[0, 0.98, -0.72]}>
          <boxGeometry args={[0.2, 0.08, 0.04]} />
          <meshStandardMaterial color="#ff3b3b" emissive="#ff1f1f" emissiveIntensity={1.2} />
        </mesh>
        {/* steering fork + front wheel */}
        <group ref={fork} position={[0, 0, 0.78]}>
          <mesh position={[0, 0.8, 0]} rotation={[-0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.95, 0.08]} />
            <meshStandardMaterial color={METAL} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.22, -0.12]} castShadow>
            <boxGeometry args={[0.8, 0.06, 0.06]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, 1.08, 0.08]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#fff6d5" emissive="#ffe8a3" emissiveIntensity={0.9} />
          </mesh>
          <group position={[0, 0, 0.12]}>
            <Wheel z={0} spinRef={front} />
          </group>
        </group>
        <Wheel z={-0.72} spinRef={back} />
        <Rider />
      </group>
      {/* soft blob shadow helps on low-end devices */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.9, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  )
}
