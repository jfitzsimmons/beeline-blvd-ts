import { clamp } from '../utils/utils'

const { info, player } = globalThis.game.world

interface cloneparent {
  clone: node
  actor: string
  action: string
}

interface props {
  npcname: string
  clones: cloneparent[]
  watcher: string
  station: string
  consequence: {
    confront: boolean
    type: string
  }
  isNpc: boolean
}

function absolute_binaries(): [string, number][] {
  const bins = player.state.binaries
  const newbins: Array<[string, number]> = [
    [
      bins.evil_good < 0 ? 'evil' : 'good',
      bins.evil_good < 0 ? bins.evil_good * -10 : bins.evil_good * 10,
    ],
    [
      bins.passiveAggressive < 0 ? 'passive' : 'aggressive',
      bins.passiveAggressive < 0
        ? bins.passiveAggressive * -10
        : bins.passiveAggressive * 10,
    ],
    [
      bins.lawlessLawful < 0 ? 'lawless' : 'lawful',
      bins.lawlessLawful < 0
        ? bins.lawlessLawful * -10
        : bins.lawlessLawful * 10,
    ],
    [
      bins.anti_authority < 0 ? 'defiance' : 'authority',
      bins.anti_authority < 0
        ? bins.anti_authority * -10
        : bins.anti_authority * 10,
    ],
    [
      bins.un_educated < 0 ? 'commoner' : 'academic',
      bins.un_educated < 0 ? bins.un_educated * -10 : bins.un_educated * 10,
    ],
    [
      bins.poor_wealthy < 0 ? 'modesty' : 'swanky',
      bins.poor_wealthy < 0 ? bins.poor_wealthy * -10 : bins.poor_wealthy * 10,
    ],
    ...Object.entries(player.state.skills),
  ]

  newbins.sort((n1, n2) => {
    if (n1[0] <= n2[0]) {
      return -1
    }
    return 1
  })
  return newbins
}

function set_stats() {
  const stats = absolute_binaries()
  const spacing = 28
  let nodepos = gui.get_position(gui.get_node('stats'))
  nodepos.y = nodepos.y + spacing - 30
  nodepos.x = nodepos.x + spacing + 12
  let count = 1

  for (const s of stats) {
    print(s[0], '|', s[1])
    nodepos.y = nodepos.y - spacing
    nodepos = vmath.vector3(nodepos)
    let node = gui.get_node('stat_text')
    let clone = gui.clone(node)
    gui.set_text(clone, tostring(s[0]))
    gui.set_position(clone, nodepos)
    gui.set_enabled(clone, true)

    node = count % 2 == 0 ? gui.get_node('bar1') : gui.get_node('bar2')
    clone = gui.clone(node)
    nodepos.x = nodepos.x + 8
    gui.set_position(clone, nodepos)
    gui.set_size(clone, vmath.vector3(clamp(s[1], 0, 10) * 16, 26, 1))
    gui.set_enabled(clone, true)
    nodepos.x = nodepos.x - 8
    count = count + 1
  }
}

function set_ranks() {
  const factions = [...Object.entries(player.state.factions)].sort(function (
    a,
    b
  ) {
    return b[1] - a[1]
  })
  const gangs = [...Object.entries(player.state.gangs)].sort(function (a, b) {
    return b[1] - a[1]
  })
  const spacing = 28
  let nodepos = gui.get_position(gui.get_node('factions'))
  nodepos.y = nodepos.y + spacing - 30
  let count = 1
  for (const faction of factions) {
    nodepos.y = nodepos.y - spacing
    nodepos = vmath.vector3(nodepos)
    const node = gui.get_node('faction_text')
    const clone = gui.clone(node)
    gui.set_text(clone, `${count}. ${faction[0]}`)
    gui.set_position(clone, nodepos)
    gui.set_enabled(clone, true)
    count = count + 1
  }
  nodepos = gui.get_position(gui.get_node('gangs'))
  nodepos.y = nodepos.y + spacing - 30
  count = 1
  for (const gang of gangs) {
    nodepos.y = nodepos.y - spacing
    nodepos = vmath.vector3(nodepos)
    const node = gui.get_node('gang_text')
    const clone = gui.clone(node)
    gui.set_text(clone, `${count}. ${gang[0]}`)
    gui.set_position(clone, nodepos)
    gui.set_enabled(clone, true)
    count = count + 1
  }
}

function set_interactions(screen: string) {
  const spacing = 32
  let nodepos = gui.get_position(gui.get_node(screen))
  const screentype = screen == 'interaction' ? info.interactions : info.rumors
  nodepos.y = nodepos.y + spacing

  for (const bullet of screentype) {
    nodepos.y = nodepos.y - spacing
    nodepos = vmath.vector3(nodepos)
    const node = gui.get_node(screen)
    gui.set_text(node, tostring(bullet))
    const clone = gui.clone(node)
    const textClone = gui.clone(gui.get_node(`${screen}_text`))
    gui.set_text(textClone, bullet)
    gui.set_position(clone, nodepos)
    gui.set_enabled(clone, true)
    gui.set_position(textClone, vmath.vector3(nodepos.x + 8, nodepos.y, 1))
    gui.set_enabled(textClone, true)
  }
}

export function init(this: props): void {
  this.clones = []
  set_interactions('interaction')
  set_interactions('rumor')
  set_stats()
  set_ranks()
}
