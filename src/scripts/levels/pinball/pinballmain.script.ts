interface props {
  left: boolean
  right: boolean
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
    reference_angle: math.rad(0), // The bodyB angle minus bodyA angle in the reference state (radians).
    lower_angle: math.rad(-30), // The lower angle for the joint limit (radians).
    upper_angle: math.rad(30), // The upper angle for the joint limit (radians).
    max_motor_torque: undefined, // The maximum motor torque used to achieve the desired motor speed. Usually in N-m.
    motor_speed: undefined, // The desired motor speed. Usually in radians per second.
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
    force: vmath.vector3(0, 20000, 0), // 25N from 'solenoid' /* 10 for scale* 5 for ball weight compensation
  }
  msg.post(flipper, 'apply_force', message)
}

function remove_flipper_force(flipper: string, offset: vmath.vector3) {
  print('remove_flipper_force', flipper)
  const position = go.get_position(flipper)
  const message = {
    position: position + offset,
    force: vmath.vector3(0, -5000, 0), // times mass
  }
  msg.post(flipper, 'apply_force', message)
}

export function init(this: props) {
  this.left = false
  this.right = false

  create_flipper_joint('lflipper#collisionobject', 'lhinge#collisionobject')
  create_flipper_joint('llflipper#collisionobject', 'llhinge#collisionobject')
  create_flipper_joint('rflipper#collisionobject', 'rhinge#collisionobject')
  create_flipper_joint('rrflipper#collisionobject', 'rrhinge#collisionobject')

  msg.post('.', 'acquire_input_focus')
}

export function fixed_update(this: props, _dt: number) {
  if (this.left) {
    // apply_flipper_force('lflipper#rubber', vmath.vector3(300, 0, 0))
    apply_flipper_force('lflipper#collisionobject', vmath.vector3(300, 0, 0))
    apply_flipper_force('llflipper#collisionobject', vmath.vector3(300, 0, 0))
  }
  if (this.right) {
    apply_flipper_force('rflipper#collisionobject', vmath.vector3(-300, 0, 0))
    apply_flipper_force('rrflipper#collisionobject', vmath.vector3(-300, 0, 0))
  }
}

export function on_input(
  this: props,
  actionId: hash,
  action: {
    value: number
    released: boolean
  }
) {
  if (actionId == hash('leftflip')) {
    this.left = action.value != 0
    if (action.released) {
      remove_flipper_force('lflipper#collisionobject', vmath.vector3(300, 0, 0))
      remove_flipper_force(
        'llflipper#collisionobject',
        vmath.vector3(300, 0, 0)
      )
    }
  } else if (actionId == hash('rightflip')) {
    this.right = action.value != 0
    if (action.released) {
      remove_flipper_force(
        'rflipper#collisionobject',
        vmath.vector3(-300, 0, 0)
      )
      remove_flipper_force(
        'rrflipper#collisionobject',
        vmath.vector3(-300, 0, 0)
      )
    }
  }
}
