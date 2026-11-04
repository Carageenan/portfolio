// Live game state shared between the 3D scene and the HTML overlay.
// Mutated every frame; UI subscribes to the low-frequency events.

export const MAP_HALF = 60

export const bike = {
  x: 0,
  z: 10,
  heading: Math.PI, // radians, 0 = facing +z
  speed: 0,
}

const listeners = new Set()
export const ui = {
  nearby: null, // story id the bike is close to
  visited: new Set(),
}

export function emit() {
  listeners.forEach((fn) => fn())
}
export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Request to teleport (from the story list).
export const teleport = { target: null }
