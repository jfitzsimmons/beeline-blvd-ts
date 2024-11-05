/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const { player } = globalThis.game.world

const DISPLAY_WIDTH: number = tonumber(sys.get_config_int('display.width'))!

const DISPLAY_HEIGHT: number = tonumber(sys.get_config_int('display.height'))!
const speed = 250
type matrix4Temp = number & {
  c0: vmath.vector4
  c1: vmath.vector4
  c2: vmath.vector4
  c3: vmath.vector4
  m00: number
  m01: number
  m02: number
  m03: number
  m04: number
  m10: number
  m11: number
  m12: number
  m13: number
  m14: number
  m20: number
  m21: number
  m22: number
  m23: number
  m24: number
  m30: number
  m31: number
  m32: number
  m33: number
  m34: number
}
interface props {
  dir: vmath.vector3
  current_anim: hash
  correction: vmath.vector3
}
export function init(this: props) {
  msg.post('#camera', 'acquire_camera_focus')
  msg.post('@render:', 'use_camera_projection')
  msg.post('#', 'acquire_input_focus')

  this.dir = vmath.vector3()
  this.current_anim = hash('idle')
  // correction vector
  this.correction = vmath.vector3()
}

// Convert from screen to world coordinates
// @param sx Screen x
// @param sy Screen y
// @param sz Screen z
// @param window_width Width of the window (use render.get_width() or window.get_size().x)
// @param window_height Height of the window (use render.get_height() or window.get_size().y)
// @param projection Camera/render projection (use go.get("#camera", "projection"))
// @param view Camera/render view (use go.get("#camera", "view"))
// @return wx World x
// @return wy World y
// @return wz World z
function screen_to_world(x: number, y: number, z: number, camera: string) {
  const projection: matrix4Temp = go.get(camera, 'projection')
  const view: matrix4Temp = go.get(camera, 'view')
  const total = (projection * view) as matrix4Temp

  let [w, h] = window.get_size()
  // The window.get_size() function will return the scaled window size,
  // ie taking into account display scaling (Retina screens on macOS for
  // instance). We need to adjust for display scaling in our calculation.
  w = w / (w / DISPLAY_WIDTH)
  h = h / (h / DISPLAY_HEIGHT)
  // https://defold.com/manuals/camera/#converting-mouse-to-world-coordinates
  const inv = vmath.inv(total) as matrix4Temp

  x = (2 * x) / w - 1
  y = (2 * y) / h - 1
  z = 2 * z - 1

  const x1 = x * inv.m00 + y * inv.m01 + z * inv.m02 + inv.m03
  const y1 = x * inv.m10 + y * inv.m11 + z * inv.m12 + inv.m13
  const z1 = x * inv.m20 + y * inv.m21 + z * inv.m22 + inv.m23

  return { x1, y1, z1 }
}

export function update(this: props, dt: number) {
  if (vmath.length_sqr(this.dir) > 1) {
    this.dir = vmath.normalize(this.dir)
  }
  let p = go.get_position()
  p = vmath.vector3(p + this.dir * speed * dt)
  screen_to_world(
    p.x - DISPLAY_WIDTH / 2,
    p.y - DISPLAY_HEIGHT / 2,
    1,
    '#camera'
  )
  go.set_position(p)

  let anim = hash('idle')

  if (this.dir.x > 0) {
    anim = hash('runright')
  } else if (this.dir.x < 0) {
    anim = hash('runleft')
  } else if (this.dir.y > 0) {
    anim = hash('runup')
  } else if (this.dir.y < 0) {
    anim = hash('rundown')
  }

  if (anim != this.current_anim) {
    msg.post('#sprite', 'play_animation', { id: anim })
    this.current_anim = anim
  }

  // reset correction
  this.correction = vmath.vector3()
}
export function on_message(
  this: props,
  messageId: hash,
  message: { distance: number; normal: number },
  _sender: url
): void {
  if (messageId == hash('wake_up')) {
    const [ww, wh] = window.get_size()
    const pos = player.pos
    const targetpos = vmath.vector3(pos.x, pos.y, 1)
    if (pos.y > wh - 100) {
      targetpos.y = 150
      targetpos.x = pos.x
    } else if (pos.y < 100) {
      targetpos.y = wh - 150
      targetpos.x = pos.x
    }
    if (pos.x > ww - 100) {
      targetpos.x = 150
      targetpos.y = pos.y
    } else if (pos.x < 100) {
      targetpos.x = ww - 150
      targetpos.y = pos.y
    }

    screen_to_world(targetpos.x, targetpos.y, 1, '#camera')
    go.set_position(targetpos)
    go.set_position(vmath.vector3(targetpos.x, targetpos.y, 1))
  }
  // Handle collision
  if (messageId == hash('contact_point_response')) {
    if (message.distance > 0) {
      const proj = vmath.project(
        this.correction,
        vmath.vector3(message.normal * message.distance)
      )
      if (proj < 1) {
        // Only care for projections that does not overshoot.
        const comp =
          (message.distance - message.distance * proj) * message.normal
        // Apply compensation
        const position = vmath.vector3(go.get_position() + comp)
        go.set_position(position)
        screen_to_world(position.x, position.y, 1, '#camera')
        // Accumulate correction done
        this.correction = vmath.vector3(this.correction + comp)
      }
    }
  }
}
export function on_input(
  this: props,
  actionId: hash,
  action: {
    released: boolean
    x: number
    y: number
  }
) {
  if (actionId == hash('front')) {
    this.dir.y = -1
  } else if (actionId == hash('back')) {
    this.dir.y = 1
  } else if (actionId == hash('left')) {
    this.dir.x = -1
  } else if (actionId == hash('right')) {
    this.dir.x = 1
  }

  if (action.released) {
    // reset velocity if input was released
    this.dir = vmath.vector3()
  }
}
