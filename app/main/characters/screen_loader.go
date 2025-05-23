components {
  id: "screen_loader"
  component: "/main/characters/screen_loader.script"
}
embedded_components {
  id: "screensprite"
  type: "sprite"
  data: "default_animation: \"fredai\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/levels/00_front_grounds/level0.atlas\"\n"
  "}\n"
  ""
  position {
    z: 0.2
  }
}
embedded_components {
  id: "fluid"
  type: "collisionobject"
  data: "type: COLLISION_OBJECT_TYPE_TRIGGER\n"
  "mass: 0.0\n"
  "friction: 0.1\n"
  "restitution: 0.5\n"
  "group: \"fluid\"\n"
  "mask: \"default\"\n"
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
  "  data: 33.467\n"
  "  data: 41.8565\n"
  "  data: 10.0\n"
  "}\n"
  ""
}
embedded_components {
  id: "solid"
  type: "collisionobject"
  data: "type: COLLISION_OBJECT_TYPE_STATIC\n"
  "mass: 0.0\n"
  "friction: 1.0\n"
  "restitution: 0.5\n"
  "group: \"solid\"\n"
  "mask: \"default\"\n"
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
  "  data: 21.1765\n"
  "  data: 31.42\n"
  "  data: 10.0\n"
  "}\n"
  ""
}
