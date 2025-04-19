components {
  id: "pinballCollisions"
  component: "/main/levels/pinball/pinballCollisions.tilemap"
}
embedded_components {
  id: "collisionobject"
  type: "collisionobject"
  data: "collision_shape: \"/main/levels/pinball/pinballCollisions.tilemap\"\n"
  "type: COLLISION_OBJECT_TYPE_STATIC\n"
  "mass: 0.0\n"
  "friction: 1.0\n"
  "restitution: 0.1\n"
  "group: \"obstacles\"\n"
  "mask: \"ball\"\n"
  "locked_rotation: true\n"
  "event_collision: false\n"
  "event_contact: false\n"
  "event_trigger: false\n"
  ""
}
