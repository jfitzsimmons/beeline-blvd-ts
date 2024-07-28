interface props {
  current_proxy: url | null
  left: boolean
  right: boolean
}
interface url {
  fragment: hash
}
function create_flipper_joint(flipper: string, hinge: string) {
  const joint_type = 2
  const collisionobject_a = flipper
  const joint_id = 'hinge'
  const position_a = vmath.vector3(0, 0, 0)
  const collisionobject_b = hinge
  const position_b = vmath.vector3(0, 0, 0)
  const properties = {
    enable_limit: true, // A flag to enable joint limits.
    //testjpf flip neg and psitive for left flip??
    reference_angle: math.rad(0), // The bodyB angle minus bodyA angle in the reference state (radians).
    lower_angle: math.rad(-25), // The lower angle for the joint limit (radians).
    upper_angle: math.rad(25), // The upper angle for the joint limit (radians).
    max_motor_torque: null, // The maximum motor torque used to achieve the desired motor speed. Usually in N-m.
    motor_speed: null, // The desired motor speed. Usually in radians per second.
    enable_motor: false, // A flag to enable the joint motor.
  }
  physics.create_joint(
    joint_type,
    collisionobject_a,
    joint_id,
    position_a,
    collisionobject_b,
    position_b,
    properties
  )
}

function apply_flipper_force(flipper: string, offset: vmath.vector3) {
  const position = go.get_position(flipper)
  const message = {
    position: position + offset,
    force: vmath.vector3(0, 10000 * 50, 0), // times mass
  }
  msg.post(flipper, 'apply_force', message)
}

function show(curr_proxy: url | null, proxy: string) {
  if (curr_proxy != null) {
    msg.post('#', 'unload_pinball')
  } else {
    msg.post(proxy, 'async_load')
  }
}

export function init(this: props) {
  this.current_proxy = null
  this.left = false
  this.right = false
}

export function update(this: props, _dt: number) {
  if (this.left) {
    apply_flipper_force('leftflipper#collisionobject', vmath.vector3(150, 0, 0))
  }
  if (this.right) {
    print('right')
    apply_flipper_force(
      'rightflipper#collisionobject',
      vmath.vector3(-150, 0, 0)
    )
  }
}

export function on_message(
  this: props,
  messageId: hash,
  _message: unknown,
  _sender: url
): void {
  if (messageId == hash('show_pinball')) {
    show(this.current_proxy, '#pinball00')
  } else if (messageId == hash('unload_pinball')) {
    if (this.current_proxy != null) {
      msg.post(this.current_proxy, 'disable')
      msg.post(this.current_proxy, 'final')
      msg.post(this.current_proxy, 'unload')
      this.current_proxy = null
    }
  } else if (messageId == hash('proxy_loaded')) {
    this.current_proxy = _sender
    /** 
    if (_sender.fragment == hash('pinball')) {
      msg.post('pinball:/main#main', 'wake_up')
    }
    **/
    msg.post(this.current_proxy, 'enable')
    create_flipper_joint(
      'leftflipper#collisionobject',
      'lefthinge#collisionobject'
    )
    create_flipper_joint(
      'rightflipper#collisionobject',
      'righthinge#collisionobject'
    )
    //msg.post('.', 'release_input_focus')
    //msg.post('.', 'acquire_input_focus')
  }
}

export function on_input(
  this: props,
  action_id: hash,
  action: {
    value: number
  }
) {
  if (this.current_proxy !== hash('pinball00')) return
  if (action_id == hash('leftflip')) {
    this.left = action.value != 0
  } else if (action_id == hash('rightflip')) {
    this.right = action.value != 0
  }
}
