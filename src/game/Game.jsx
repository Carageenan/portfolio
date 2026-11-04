import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Bike } from './Bike'
import { Landmark } from './Landmarks'
import { bike, ui, emit, subscribe, teleport, MAP_HALF } from './state'
import { input, bindKeyboard } from './input'
import { stories } from '../content/stories'
import { useLang } from '../i18n'

const TRIGGER = 8.4
const BUILDING_R = 4.6

// deterministic pseudo-random so the map looks the same every visit
function rng(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

function useTrees() {
  return useMemo(() => {
    const r = rng(7)
    const trees = []
    let guard = 0
    while (trees.length < 140 && guard++ < 4000) {
      const x = (r() * 2 - 1) * (MAP_HALF - 5)
      const z = (r() * 2 - 1) * (MAP_HALF - 5)
      if (Math.hypot(x, z - 10) < 8) continue // spawn
      if (stories.some((s) => Math.hypot(x - s.pos[0], z - s.pos[1]) < 11)) continue
      if (onRoad(x, z, 3.5)) continue
      if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 3)) continue
      trees.push({ x, z, s: 0.8 + r() * 0.7, h: r() })
    }
    return trees
  }, [])
}

// roads: centre hub to each landmark
const HUB = [0, 10]
function segDist(px, pz, ax, az, bx, bz) {
  const vx = bx - ax, vz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (pz - az) * vz) / (vx * vx + vz * vz)))
  return Math.hypot(px - (ax + vx * t), pz - (az + vz * t))
}
function onRoad(x, z, w) {
  return stories.some((s) => segDist(x, z, HUB[0], HUB[1], s.pos[0], s.pos[1]) < w)
}

function Roads() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[HUB[0], 0.015, HUB[1]]} receiveShadow>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color="#5c5c5c" roughness={1} />
      </mesh>
      {stories.map((s) => {
        const dx = s.pos[0] - HUB[0]
        const dz = s.pos[1] - HUB[1]
        const len = Math.hypot(dx, dz)
        return (
          <group key={s.id} position={[HUB[0] + dx / 2, 0, HUB[1] + dz / 2]} rotation={[0, Math.atan2(dx, dz), 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
              <planeGeometry args={[4.2, len]} />
              <meshStandardMaterial color="#5c5c5c" roughness={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <planeGeometry args={[0.15, len - 12]} />
              <meshBasicMaterial color="#f1e3a4" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Trees({ trees }) {
  const trunks = useRef()
  const leaves = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    const col = new THREE.Color()
    trees.forEach((t, i) => {
      m.position.set(t.x, 0.9 * t.s, t.z)
      m.scale.setScalar(t.s)
      m.updateMatrix()
      trunks.current.setMatrixAt(i, m.matrix)
      m.position.set(t.x, 2.6 * t.s, t.z)
      m.updateMatrix()
      leaves.current.setMatrixAt(i, m.matrix)
      leaves.current.setColorAt(i, col.setHSL(0.27 + t.h * 0.08, 0.45, 0.32 + t.h * 0.12))
    })
    trunks.current.instanceMatrix.needsUpdate = true
    leaves.current.instanceMatrix.needsUpdate = true
    leaves.current.instanceColor.needsUpdate = true
  }, [trees])
  return (
    <>
      <instancedMesh ref={trunks} args={[null, null, trees.length]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 1.8, 6]} />
        <meshStandardMaterial color="#7a5230" />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[null, null, trees.length]} castShadow>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial flatShading />
      </instancedMesh>
    </>
  )
}

function Island() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#5fa8d3" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.32, 0]} receiveShadow>
        <boxGeometry args={[MAP_HALF * 2 + 6, 0.6, MAP_HALF * 2 + 6]} />
        <meshStandardMaterial color="#e9d8a6" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[MAP_HALF * 2, MAP_HALF * 2]} />
        <meshStandardMaterial color="#8fbf6a" roughness={1} />
      </mesh>
    </>
  )
}

function FollowRig() {
  const { camera } = useThree()
  const light = useRef()
  const target = useMemo(() => new THREE.Object3D(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const want = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    const fx = Math.sin(bike.heading)
    const fz = Math.cos(bike.heading)
    const back = 9 + Math.abs(bike.speed) * 0.12
    want.set(bike.x - fx * back, 5.2 + Math.abs(bike.speed) * 0.05, bike.z - fz * back)
    camera.position.lerp(want, 1 - Math.exp(-dt * 4))
    look.set(bike.x + fx * 3, 1.2, bike.z + fz * 3)
    camera.lookAt(look)
    light.current.position.set(bike.x + 18, 30, bike.z + 12)
    target.position.set(bike.x, 0, bike.z)
    target.updateMatrixWorld()
  })
  return (
    <directionalLight
      ref={light}
      target={target}
      intensity={2.2}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-30}
      shadow-camera-right={30}
      shadow-camera-top={30}
      shadow-camera-bottom={-30}
      shadow-bias={-0.0005}
    />
  )
}

function Proximity() {
  useFrame(() => {
    if (teleport.target) {
      const s = stories.find((x) => x.id === teleport.target)
      if (s) {
        const a = Math.atan2(HUB[0] - s.pos[0], HUB[1] - s.pos[1])
        bike.x = s.pos[0] + Math.sin(a) * 7
        bike.z = s.pos[1] + Math.cos(a) * 7
        bike.heading = a + Math.PI
        bike.speed = 0
      }
      teleport.target = null
    }
    let near = null
    for (const s of stories) {
      if (Math.hypot(bike.x - s.pos[0], bike.z - s.pos[1]) < TRIGGER) near = s.id
    }
    if (near !== ui.nearby) {
      ui.nearby = near
      emit()
    }
    if (input.interact) {
      input.interact = false
      if (ui.nearby) window.dispatchEvent(new CustomEvent('open-story', { detail: ui.nearby }))
    }
  })
  return null
}

export default function Game({ active = true }) {
  const { pick } = useLang()
  const trees = useTrees()
  const colliders = useMemo(
    () => [
      ...stories.map((s) => ({ x: s.pos[0], z: s.pos[1], r: BUILDING_R })),
      ...trees.map((t) => ({ x: t.x, z: t.z, r: 0.35 * t.s })),
    ],
    [trees],
  )
  const [, force] = useState(0)
  useEffect(() => subscribe(() => force((n) => n + 1)), [])
  useEffect(() => bindKeyboard(), [])

  return (
    <Canvas
      shadows
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ fov: 55, near: 0.1, far: 400, position: [0, 6, 0] }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#bfe3f2']} />
      <fog attach="fog" args={['#bfe3f2', 60, 160]} />
      <hemisphereLight args={['#ffffff', '#6a8f4e', 0.9]} />
      <FollowRig />
      <Island />
      <Roads />
      <Trees trees={trees} />
      {stories.map((s) => (
        <Landmark
          key={s.id}
          story={s}
          label={pick(s.title)}
          visited={ui.visited.has(s.id)}
          near={ui.nearby === s.id}
        />
      ))}
      <Bike colliders={colliders} />
      <Proximity />
    </Canvas>
  )
}
