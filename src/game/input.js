// Shared input state, read every frame by the bike.
// Keyboard and the touch joystick both write here.

export const input = {
  throttle: 0, // -1..1
  steer: 0, // -1..1 (positive = left)
  boost: false,
  brake: false,
  interact: false, // one-shot, consumed by the game
}

const keys = new Set()

function sync() {
  const up = keys.has('KeyW') || keys.has('ArrowUp')
  const down = keys.has('KeyS') || keys.has('ArrowDown')
  const left = keys.has('KeyA') || keys.has('ArrowLeft')
  const right = keys.has('KeyD') || keys.has('ArrowRight')
  input.throttle = (up ? 1 : 0) - (down ? 1 : 0)
  input.steer = (left ? 1 : 0) - (right ? 1 : 0)
  input.boost = keys.has('ShiftLeft') || keys.has('ShiftRight')
  input.brake = keys.has('Space')
}

function isTyping(e) {
  const el = e.target
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

export function bindKeyboard() {
  const down = (e) => {
    if (isTyping(e)) return
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
    if (e.code === 'KeyE' || e.code === 'Enter') input.interact = true
    keys.add(e.code)
    sync()
  }
  const up = (e) => {
    keys.delete(e.code)
    sync()
  }
  const blur = () => {
    keys.clear()
    sync()
  }
  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', blur)
  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', blur)
  }
}

// Touch joystick writes analog values directly.
export function setJoystick(x, y) {
  // x: -1 (left) .. 1 (right), y: -1 (up/forward) .. 1 (down)
  input.throttle = -y
  input.steer = -x
}
