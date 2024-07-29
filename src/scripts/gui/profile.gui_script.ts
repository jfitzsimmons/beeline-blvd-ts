/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { clamp } from '../utils/utils'

//import { clamp } from '../utils/utils'

//import { interactionsGroup } from '../../types/tasks'

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

export function init(this: props): void {
  this.clones = []
  set_interactions('interaction')
  set_interactions('rumor')
  set_stats()
}

function absolute_binaries(): [string, number][] {
  const bins = player.state.binaries
  print('vil_good ', bins.evil_good)
  const newbins: Array<[string, number]> = [
    [
      bins.evil_good < 0 ? 'evil' : 'good',
      bins.evil_good < 0 ? bins.evil_good * -10 : bins.evil_good * 10,
    ],
    [
      bins.passive_aggressive < 0 ? 'passive' : 'aggressive',
      bins.passive_aggressive < 0
        ? bins.passive_aggressive * -10
        : bins.passive_aggressive * 10,
    ],
    [
      bins.lawless_lawful < 0 ? 'lawless' : 'lawful',
      bins.lawless_lawful < 0
        ? bins.lawless_lawful * -10
        : bins.lawless_lawful * 10,
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
  //testjpf
  // get skills kvp and bin kvp and combine into one
  // bins need to be multiplied by ten
  //and negative ones need to be removed

  const stats = absolute_binaries()

  const spacing = 28
  let nodepos = gui.get_position(gui.get_node('stats'))
  //let cKey: keyof typeof stats
  //const screentype = screen == 'interaction' ? info.interactions : info.rumors
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

function set_interactions(screen: string) {
  //TESTJPF do same for rumors
  //combine into 1 function
  //const clones = []
  const spacing = 32
  //testjpf do getnode
  let nodepos = gui.get_position(gui.get_node(screen))
  //let cKey: keyof typeof info.interactions
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
