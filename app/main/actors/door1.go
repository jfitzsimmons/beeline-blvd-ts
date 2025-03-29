components {
  id: "door1"
  component: "/scripts/actors/door1.script"
}
embedded_components {
  id: "collisionobject"
  type: "collisionobject"
  data: "type: COLLISION_OBJECT_TYPE_KINEMATIC\n"
  "mass: 0.0\n"
  "friction: 0.1\n"
  "restitution: 0.5\n"
  "group: \"default\"\n"
  "mask: \"default\"\n"
  "embedded_collision_shape {\n"
  "  shapes {\n"
  "    shape_type: TYPE_BOX\n"
  "    position {\n"
  "      x: 2.395\n"
  "      y: -0.419\n"
  "    }\n"
  "    rotation {\n"
  "      z: -0.70710677\n"
  "      w: 0.70710677\n"
  "    }\n"
  "    index: 0\n"
  "    count: 3\n"
  "  }\n"
  "  data: 40.0\n"
  "  data: 25.0\n"
  "  data: 10.0\n"
  "}\n"
  "event_collision: false\n"
  "event_trigger: false\n"
  ""
}
embedded_components {
  id: "sprite"
  type: "sprite"
  data: "default_animation: \"golddoubledoor\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/levels/01_vipreception/level1.atlas\"\n"
  "}\n"
  ""
  position {
    z: 1.0
  }
}
