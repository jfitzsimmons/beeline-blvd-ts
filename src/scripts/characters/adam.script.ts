import { WindowHack } from '../../types/utils'

const { player } = globalThis.game.world
const speed = 250
interface props {
  input: vmath.vector3
  current_anim: hash
  correction: vmath.vector3
}
function WindowResize(event: unknown) {
  if (event == window.WINDOW_EVENT_RESIZED) {
    const [ww, wh] = window.get_size()
    const localZoom =
      math.max(ww / 1408, wh / 896) /
      (window as unknown as WindowHack).get_display_scale()
    go.set('#camera', 'orthographic_zoom', localZoom)
  }
}

export function init(this: props) {
  window.set_listener(WindowResize)
  msg.post('@render:', 'use_camera_projection')
  msg.post('#camera', 'acquire_camera_focus')

  const [ww, wh] = window.get_size()
  const localZoom =
    math.max(ww / 1408, wh / 896) /
    (window as unknown as WindowHack).get_display_scale()
  go.set('#camera', 'orthographic_zoom', localZoom)

  msg.post('#', 'acquire_input_focus')

  //this.dir = vmath.vector3()
  this.input = vmath.vector3()

  this.current_anim = hash('idle')
  // correction vector
  this.correction = vmath.vector3()
  //this.velocity = vmath.vector3()
}

export function update(this: props, dt: number) {
  // if vmath.length_sqr(self.input) > 1 then        -- [1]
  // self.input = vmath.normalize(self.input)
  //end

  if (vmath.length_sqr(this.input) > 1) {
    this.input = vmath.normalize(this.input)
  }
  const movement = this.input * speed * dt

  const p = go.get_position()
  go.set_position(vmath.vector3(p + movement))

  let anim = hash('idle')

  if (this.input.x > 0) {
    anim = hash('runright')
  } else if (this.input.x < 0) {
    anim = hash('runleft')
  } else if (this.input.y > 0) {
    anim = hash('runup')
  } else if (this.input.y < 0) {
    anim = hash('rundown')
  }

  if (anim != this.current_anim) {
    msg.post('#sprite', 'play_animation', { id: anim })
    this.current_anim = anim
  }

  // reset correction
  this.correction = vmath.vector3()
  this.input = vmath.vector3()
}
export function on_message(
  this: props,
  messageId: hash,
  message: { distance: number; normal: number },
  _sender: url
): void {
  if (messageId == hash('wake_up')) {
    const pos = player.pos
    const targetpos = vmath.vector3(pos.x, pos.y, 0.5)
    if (pos.y > 896 - 100) {
      targetpos.y = 150
      targetpos.x = pos.x
    } else if (pos.y < 100) {
      targetpos.y = 896 - 150
      targetpos.x = pos.x
    }
    if (pos.x > 1408 - 100) {
      targetpos.x = 150
      targetpos.y = pos.y
    } else if (pos.x < 100) {
      targetpos.x = 1408 - 150
      targetpos.y = pos.y
    }

    go.set_position(vmath.vector3(targetpos.x, targetpos.y, 0.5))
    print('wakeupcall')
    msg.post('#', 'acquire_input_focus')
  } else if (messageId === hash('get_focus')) {
    print('getfocuscall')

    msg.post('#', 'acquire_input_focus')
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
        go.set_position(vmath.vector3(go.get_position() + comp))
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
  }
) {
  if (actionId == hash('front')) {
    this.input.y = -1
  } else if (actionId == hash('back')) {
    this.input.y = 1
  } else if (actionId == hash('left')) {
    this.input.x = -1
  } else if (actionId == hash('right')) {
    this.input.x = 1
  }
  if (action.released) {
    // reset velocity if input was released
    this.input = vmath.vector3()
  }
}
