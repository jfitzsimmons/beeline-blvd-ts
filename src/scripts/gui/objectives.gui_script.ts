/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

//import { ObjectivesGroup } from '../../types/tasks'

const { info } = globalThis.game.world

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
  set_interactions()
}

function set_interactions() {
  //const clones = []
  const spacing = 25
  //testjpf do getnode
  let nodepos = vmath.vector3(30, 793, 1)
  let cKey: keyof typeof info.objectives

  for (cKey in info.objectives) {
    // ex tutorial
    //cKey is quest
    print('OB GUI::: cKey::', cKey)
    const cpoint = info.objectives[cKey]
    let qKey: keyof typeof cpoint.quest
    //ex med_assist
    //testjpf cpoint.quest is nill
    //STARThere
    for (qKey in cpoint.quest) {
      print('OB GUI::: qKey::', qKey)
      nodepos.y = nodepos.y + spacing
      nodepos = vmath.vector3(nodepos)
      const node = gui.get_node('quest')
      //const testjpffart = tostring(qKey)
      gui.set_text(node, tostring(qKey))
      const clone = gui.clone(node)
      gui.set_position(clone, nodepos)
      gui.set_visible(clone, true)

      const conditions = info.objectives[cKey].quest[qKey].objective
      let cNum: keyof typeof conditions
      for (cNum in conditions) {
        //testjpf
        const condition = conditions[cNum]
        nodepos.y = nodepos.y + spacing * 1.3
        nodepos.x = nodepos.x - 25
        gui.set_text(gui.get_node('objective_text'), condition.label)

        const node = gui.get_node('objective')
        const clone = gui.clone(node)
        gui.set_position(clone, nodepos)
        gui.set_visible(clone, true)
      }
    }
  }
}

export function on_message(this: props, messageId: hash, _sender: url): void {
  if (messageId == hash('shownode')) {
    //populate text nodes && show them
    // set_interactions() //GO.pos cannot come from gui script
  } else if (messageId == hash('hidenode')) {
    for (const clone of this.clones) {
      gui.delete_node(clone.clone)
    }
    this.clones = []
    this.watcher = ''
  }
}
