const { player } = globalThis.game.world
const speed = 250
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

export function update(this: props, dt: number) {
  if (vmath.length_sqr(this.dir) > 1) {
    this.dir = vmath.normalize(this.dir)
  }
  const p = go.get_position()
  go.set_position(vmath.vector3(p + this.dir * speed * dt))

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
    const targetpos = vmath.vector3(pos.x, pos.y, 0.5)
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

    go.set_position(vmath.vector3(targetpos.x, targetpos.y, 0.5))
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
