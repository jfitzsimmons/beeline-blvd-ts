components {
  id: "npc_loader"
  component: "/scripts/characters/npc_loader.script"
}
components {
  id: "injury"
  component: "/assets/injury.particlefx"
}
embedded_components {
  id: "npcsprite"
  type: "sprite"
  data: "default_animation: \"race01_01\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/characters/tilesources/npcs64x128.tilesource\"\n"
  "}\n"
  ""
  position {
    y: 64.0
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
  "      y: 33.0\n"
  "    }\n"
  "    rotation {\n"
  "    }\n"
  "    index: 0\n"
  "    count: 3\n"
  "  }\n"
  "  data: 40.780487\n"
  "  data: 66.26912\n"
  "  data: 10.0\n"
  "}\n"
  ""
}
embedded_components {
  id: "solid"
  type: "collisionobject"
  data: "type: COLLISION_OBJECT_TYPE_KINEMATIC\n"
  "mass: 0.0\n"
  "friction: 1.0\n"
  "restitution: 0.5\n"
  "group: \"solid\"\n"
  "mask: \"default\"\n"
  "embedded_collision_shape {\n"
  "  shapes {\n"
  "    shape_type: TYPE_BOX\n"
  "    position {\n"
  "      y: 38.0\n"
  "    }\n"
  "    rotation {\n"
  "    }\n"
  "    index: 0\n"
  "    count: 3\n"
  "  }\n"
  "  data: 29.630259\n"
  "  data: 57.719387\n"
  "  data: 9.2\n"
  "}\n"
  ""
}
embedded_components {
  id: "npcspritebody"
  type: "sprite"
  data: "default_animation: \"church01body\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/characters/tilesources/npcs64x128.tilesource\"\n"
  "}\n"
  ""
  position {
    z: 0.2
  }
}
embedded_components {
  id: "emote1"
  type: "sprite"
  data: "default_animation: \"more\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/tile_sources/emotes.tilesource\"\n"
  "}\n"
  ""
  position {
    x: -35.0
    y: 83.0
    z: 0.4
  }
}
embedded_components {
  id: "emote3"
  type: "sprite"
  data: "default_animation: \"more\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/tile_sources/emotes.tilesource\"\n"
  "}\n"
  ""
  position {
    x: -93.0
    y: 83.0
    z: 0.4
  }
}
embedded_components {
  id: "emote2"
  type: "sprite"
  data: "default_animation: \"more\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/tile_sources/emotes.tilesource\"\n"
  "}\n"
  ""
  position {
    x: -64.0
    y: 83.0
    z: 0.4
  }
}
embedded_components {
  id: "emote4"
  type: "sprite"
  data: "default_animation: \"more\"\n"
  "material: \"/builtins/materials/sprite.material\"\n"
  "textures {\n"
  "  sampler: \"texture_sampler\"\n"
  "  texture: \"/main/tile_sources/emotes.tilesource\"\n"
  "}\n"
  ""
  position {
    x: -122.0
    y: 83.0
    z: 0.4
  }
}
