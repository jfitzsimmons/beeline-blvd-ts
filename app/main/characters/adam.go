components {
  id: "adam"
  component: "/scripts/characters/adam.script"
}
components {
  id: "interact"
  component: "/main/gui/interact/interact.gui"
}
embedded_components {
  id: "sprite"
  type: "sprite"
  data: "default_animation: \"idle\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/characters/tilesources/adam.tilesource\"\n"
  "}\n"
  ""
}
embedded_components {
  id: "adamCO"
  type: "collisionobject"
  data: "type: COLLISION_OBJECT_TYPE_KINEMATIC\n"
  "mass: 0.0\n"
  "friction: 1.0\n"
  "restitution: 0.5\n"
  "group: \"default\"\n"
  "mask: \"default\"\n"
  "mask: \"fluid\"\n"
  "mask: \"solid\"\n"
  "embedded_collision_shape {\n"
  "  shapes {\n"
  "    shape_type: TYPE_BOX\n"
  "    position {\n"
  "    }\n"
  "    rotation {\n"
  "    }\n"
  "    index: 0\n"
  "    count: 3\n"
  "  }\n"
  "  data: 20.75\n"
  "  data: 30.6\n"
  "  data: 10.0\n"
  "}\n"
  "event_collision: false\n"
  "event_trigger: false\n"
  ""
}
embedded_components {
  id: "camera"
  type: "camera"
  data: "aspect_ratio: 1.0\n"
  "fov: 1.0\n"
  "near_z: -100.0\n"
  "far_z: 100.0\n"
  "orthographic_projection: 1\n"
  ""
}
