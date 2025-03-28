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
