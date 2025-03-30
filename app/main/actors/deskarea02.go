components {
  id: "station"
  component: "/scripts/actors/station.script"
}
embedded_components {
  id: "locker"
  type: "sprite"
  data: "default_animation: \"locker\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/levels/03_customs/level3.atlas\"\n"
  "}\n"
  ""
  position {
    x: 135.0
    y: 129.0
    z: 0.1
  }
}
embedded_components {
  id: "horzdesk"
  type: "sprite"
  data: "default_animation: \"emptydesk\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/levels/03_customs/level3.atlas\"\n"
  "}\n"
  ""
  position {
    x: 89.0
    y: 12.0
    z: 0.3
  }
}
embedded_components {
  id: "vertdesk"
  type: "sprite"
  data: "default_animation: \"emptydesk02\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/levels/03_customs/level3.atlas\"\n"
  "}\n"
  ""
  position {
    x: 35.0
    y: 76.0
  }
}
embedded_components {
  id: "globeprop"
  type: "sprite"
  data: "default_animation: \"globegold\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/levels/03_customs/level3.atlas\"\n"
  "}\n"
  ""
  position {
    x: 22.0
    y: 127.0
    z: 0.1
  }
}
embedded_components {
  id: "bookprop"
  type: "sprite"
  data: "default_animation: \"deskbook01\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/levels/03_customs/level3.atlas\"\n"
  "}\n"
  ""
  position {
    x: 68.0
    y: 21.0
    z: 0.4
  }
}
embedded_components {
  id: "solid"
  type: "collisionobject"
  data: "type: COLLISION_OBJECT_TYPE_STATIC\n"
  "mass: 0.0\n"
  "friction: 0.1\n"
  "restitution: 0.5\n"
  "group: \"solid\"\n"
  "mask: \"default\"\n"
  "embedded_collision_shape {\n"
  "  shapes {\n"
  "    shape_type: TYPE_BOX\n"
  "    position {\n"
  "      x: 38.0\n"
  "      y: 94.0\n"
  "    }\n"
  "    rotation {\n"
  "    }\n"
  "    index: 0\n"
  "    count: 3\n"
  "  }\n"
  "  shapes {\n"
  "    shape_type: TYPE_BOX\n"
  "    position {\n"
  "      x: 118.0\n"
  "      y: 112.0\n"
  "    }\n"
  "    rotation {\n"
  "    }\n"
  "    index: 3\n"
  "    count: 3\n"
  "  }\n"
  "  shapes {\n"
  "    shape_type: TYPE_BOX\n"
  "    position {\n"
  "      x: 86.0\n"
  "      y: 19.0\n"
  "    }\n"
  "    rotation {\n"
  "    }\n"
  "    index: 6\n"
  "    count: 3\n"
  "  }\n"
  "  data: 40.597908\n"
  "  data: 70.82055\n"
  "  data: 13.8\n"
  "  data: 39.30056\n"
  "  data: 63.273\n"
  "  data: 13.8\n"
  "  data: 45.333435\n"
  "  data: 41.6\n"
  "  data: 41.6\n"
  "}\n"
  "event_collision: false\n"
  "event_contact: false\n"
  "event_trigger: false\n"
  ""
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
  "      x: 80.0\n"
  "      y: 77.0\n"
  "    }\n"
  "    rotation {\n"
  "    }\n"
  "    index: 0\n"
  "    count: 3\n"
  "  }\n"
  "  data: 103.086\n"
  "  data: 128.8475\n"
  "  data: 10.0\n"
  "}\n"
  "event_collision: false\n"
  "event_contact: false\n"
  ""
}
