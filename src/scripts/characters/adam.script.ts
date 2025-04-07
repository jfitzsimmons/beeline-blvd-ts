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

  this.input = vmath.vector3()
  this.current_anim = hash('idle')
  this.correction = vmath.vector3()
}

export function update(this: props, dt: number) {
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

  this.correction = vmath.vector3()
  this.input = vmath.vector3()

  //   /level#ceiling

  const fromCenterX = p.x - 704
  const fromCenterY = p.y - 448
  const flipX = fromCenterX <= 0 ? 1 : -1
  const flipY = fromCenterY <= 0 ? 1 : -1
  // const growwallx = flipX == 1 ? 0 : 1

  go.set_position(
    vmath.vector3(
      70 * (math.abs(fromCenterX) / 1408) * flipX,
      70 * (math.abs(fromCenterY) / 896) * flipY - 2,
      0.1
    ),
    '/shared/ceiling'
  )
  const skewEastWest = fromCenterY / 1224
  const skewNorthSouth = fromCenterX / (2240 + fromCenterY * -2)
  const southTESTJPF = fromCenterX / (2240 + -fromCenterY * -2)
  const yCorrectionSkew = 128 - 128 * (1 + skewEastWest * 1.1)
  const xCorrectionSkew = fromCenterX / (2240 + fromCenterY * -1.8)
  const scalingN = 1 + math.abs(fromCenterY / 1280) * flipY
  const scalingS = 1 + fromCenterY / 1280
  const scalingE = 1 + math.abs(fromCenterX / 2240) * flipX
  const scalingW = 1 + fromCenterX / 2240
  const positionYn = 896 - 896 * scalingN - (128 - 128 * scalingN)
  const positionYs = -768 + (896 - 896 * scalingS) //- (128 - 128 * scalingS + (128 - 128 * scalingS))
  const positionXe = 1280
  const positionXw = 128 - 128 * scalingW

  //WESTWALL
  go.set('/west#recWestWall', 'skewRoom.y', skewEastWest)
  go.set_scale(vmath.vector3(scalingW, 1, 1), '/west')
  go.set_position(vmath.vector3(positionXw, yCorrectionSkew, 0.3), '/west')

  //EASTWALL
  //testjpf skew probably needs to be a little higher than west wall TODO minor
  go.set('/east#recEastWall', 'skewRoom.y', -skewEastWest) //im moving the right side down a fractiion or the original 896!!
  go.set_scale(vmath.vector3(scalingE, 1, 1), '/east')
  go.set_position(
    vmath.vector3(positionXe, yCorrectionSkew + skewEastWest * 1408, 0.3),
    '/east'
  )

  // NORTHWALL
  go.set_scale(vmath.vector3(1, scalingN, 1), '/north')
  go.set_position(
    vmath.vector3(xCorrectionSkew * 896 + positionXw, positionYn, 0.3),
    '/north'
  )
  go.set('/north#recNorthWall', 'skewRoom.x', -skewNorthSouth) //im moving the right side down a fractiion or the original 896!!

  //SOUTHWALL
  go.set_scale(vmath.vector3(1, scalingS, 1), '/south')
  go.set_position(vmath.vector3(-128 * southTESTJPF, positionYs, 0.3), '/south')
  go.set('/south#recSouthWall', 'skewRoom.x', southTESTJPF) //im moving the right side down a fractiion or the original 896!!

  print(
    'MAIN:northAngle::',
    skewNorthSouth,
    'westAngle::',
    skewEastWest,
    'positions n,s,e,w::',
    positionYn,
    positionYs,
    positionXe,
    positionXw
  )
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
