/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

//import { ObjectivesGroupOpt } from '../../types/tasks'

const { info, tasks } = globalThis.game.world

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

function set_objectives() {
  const spacing = 48
  let nodepos = gui.get_position(gui.get_node('quest'))
  let cKey: keyof typeof info.objectives

  for (cKey in info.objectives) {
    // ex tutorial
    const cpoint = info.objectives[cKey]
    let qKey: keyof typeof cpoint.quest
    //ex med_assist
    for (qKey in cpoint.quest) {
      if (cpoint.quest[qKey].status == 'active') {
        nodepos.y = nodepos.y - spacing
        nodepos = vmath.vector3(nodepos)
        const node = gui.get_node('quest')
        //const testjpffart = tostring(qKey)
        gui.set_text(node, tostring(qKey))
        const clone = gui.clone(node)
        gui.set_position(clone, nodepos)
        gui.set_enabled(clone, true)

        const objectives = info.objectives[cKey].quest[qKey].objective
        let cNum: keyof typeof objectives
        for (cNum in objectives) {
          if (objectives[cNum].status == 'active') {
            //testjpf
            const objective = objectives[cNum]

            nodepos.y = nodepos.y - spacing
            //nodepos.x = nodepos.x - 25

            const boxClone = gui.clone(gui.get_node('objective'))
            const textClone = gui.clone(gui.get_node('objective_text'))
            gui.set_text(textClone, objective.label)
            gui.set_position(boxClone, nodepos)
            gui.set_enabled(boxClone, true)
            gui.set_position(
              textClone,
              vmath.vector3(nodepos.x + 16, nodepos.y, 1)
            )
            gui.set_enabled(textClone, true)

            // const clone = gui.clone(node)
            // gui.set_position(tree, nodepos)
            // gui.set_enabled(tree, true)
          }
        }
      }
    }
  }
}

export function init(this: props): void {
  info.build_objectives(tasks.quests)
  set_objectives()
}

export function on_message(this: props, messageId: hash, _sender: url): void {
  if (messageId == hash('shownode')) {
    //populate text nodes && show them
    // set_interactions() //GO.pos cannot come from gui script
  } else if (messageId == hash('hidenode')) {
    //testjpf delete???
  }
}
