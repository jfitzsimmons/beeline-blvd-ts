interface props {
  left: boolean
  right: boolean
}
export function init(this: props) {
  msg.post('.', 'acquire_input_focus')
  this.left = false
  this.right = false
  // connect two collision objects with a fixed joint constraint (rope)
  physics.create_joint(
    1,
    'fljoint#collisionobject',
    'my_test_joint',
    vmath.vector3(0, 0, 0),
    'flippersleft#collisionobject',
    vmath.vector3(-54, 11, 0),
    {
      reference_angle: math.rad(20), // The bodyB angle minus bodyA angle in the reference state (radians).
      lower_angle: math.rad(-5), // The lower angle for the joint limit (radians).
      upper_angle: math.rad(5), // The upper angle for the joint limit (radians).
      max_motor_torque: null, // The maximum motor torque used to achieve the desired motor speed. Usually in N-m.
      motor_speed: null, // The desired motor speed. Usually in radians per second.
      enable_limit: true, // A flag to enable joint limits.
      enable_motor: false, // A flag to enable the joint motor.
    }
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

export function update(this: props) {
  if (this.left) {
    apply_flipper_force(
      'flippersleft#collisionobject',
      vmath.vector3(270, 0, 0)
    )
  }
  if (this.right) {
    apply_flipper_force(
      'rightflipper#collisionobject',
      vmath.vector3(-270, 0, 0)
    )
  }
}

export function on_input(
  this: props,
  action_id: hash,
  action: {
    value: number
  }
) {
  if (action_id == hash('leftflip')) {
    this.left = action.value != 0
  } else if (action_id == hash('rightflip')) {
    this.right = action.value != 0
  }
}
