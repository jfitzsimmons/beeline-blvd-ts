/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { witness } from '../ai/ai_main'
const { npcs, rooms, tasks, player, novel } = globalThis.game.world

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
function show_ai_screen() {
  msg.post('ai_screen#ai_screen', 'show_screen')
  msg.post('#', 'release_input_focus')
}

function open_novel(_this: props) {
  print('OPEN NOVEL', _this.npcname)
  npcs.all[_this.npcname].convos = npcs.all[_this.npcname].convos + 1
  novel.npc = npcs.all[_this.npcname]
  print('just set novel npc: TESTJPF', novel.npc)

  //pass params to level to access level information
  //rtestjpf
  msg.post('level#level', 'show_scene')
  msg.post('#', 'release_input_focus')
}

function open_inventory(_this: props, actor: string, action: string) {
  const room = rooms.all[player.currentroom]
  //print('open iinventory _this.room:::', _this.room)
  if (action == 'open') {
    // station where the watcher will be located
    const station: string | undefined = room.actors[actor].watcher
    // the actual npc assigned to that station
    if (station != undefined) _this.watcher = room.stations[station]
  } else if (action == 'trade' || action == 'give' || action == 'pockets') {
    // testjpf trade will need "acceptanace"???
    _this.watcher = actor
  }
  if (_this.watcher != '' && _this.watcher != null) {
    print('open_inventory task.npc_has_caution:::')
    const prev_caution = tasks.npc_has_caution(_this.watcher, 'player')

    if (prev_caution != null) {
      _this.consequence = { confront: true, type: 'offender' }
    } else if (action == 'pockets' || action == 'open') {
      _this.consequence = witness(_this.watcher)
    } else if (action == 'trade') {
      _this.consequence = { confront: true, type: 'trade' }
    } else {
      _this.consequence = { confront: false, type: 'neutral' }
    }
  }
  if (_this.consequence.confront == true) {
    print('Confront!!!')
    if (_this.isNpc == false) {
      _this.npcname = _this.watcher
    }
    //_this.script = novel.script_builder(_this.npcname, null, null, this.consequence.type, false)
    open_novel(_this)
  } else {
    const params = {
      actorname: actor,
      isNpc: _this.isNpc,
      //room: _this.room,
      watcher: _this.watcher,
      action: action,
    }
    msg.post('inventories#inventory', 'opened_chest', params)
    msg.post('#', 'release_input_focus')
  }
}

function check_nodes(
  _this: props,
  action: { released: boolean; x: number; y: number }
) {
  for (const c of _this.clones) {
    if (
      gui.get_layer(c.clone) != hash('unclickable') &&
      gui.pick_node(c.clone, action.x, action.y)
    ) {
      if (
        c.action == 'open' ||
        c.action == 'trade' ||
        c.action == 'give' ||
        c.action == 'pockets'
      ) {
        open_inventory(_this, c.actor, c.action)
      } else if (c.action == 'talk') {
        open_novel(_this)
      } else if (c.action == 'use') {
        show_ai_screen()
      }
    }
  }
}

export function init(this: props): void {
  this.npcname = ''
  this.clones = []
  this.watcher = ''
  this.station = ''
  this.consequence = {
    confront: false,
    type: 'neutral',
  }
}

function set_interactions(
  actorsActions: {
    [key: string]: string[]
  },
  pos: vmath.vector3
): cloneparent[] {
  const clones = []
  const spacing = 25
  let nodepos = pos
  let actorKey: keyof typeof actorsActions

  for (actorKey in actorsActions) {
    for (const action of actorsActions[actorKey]) {
      nodepos.y = nodepos.y + spacing
      nodepos = vmath.vector3(nodepos)
      const node = gui.get_node(action)
      const clonetree = gui.clone_tree(node)

      let clonedNode: keyof typeof clonetree

      for (clonedNode in clonetree) {
        //for ck, cv in pairs(clonetree) do
        const clone = gui.clone(clonetree[clonedNode])
        gui.set_position(clone, nodepos)
        gui.set_visible(clone, true)

        const cloneparent: cloneparent = {
          clone: clone,
          actor: actorKey,
          action,
        }
        clones.push(cloneparent)
        //table.insert(clones, cloneparent)
      }
    }
    nodepos.y = nodepos.y + spacing * 1.3
    nodepos.x = nodepos.x - 25
    let node: node = gui.get_node('_text_label')
    gui.set_text(node, actorKey)
    node = gui.get_node('label')

    //TS-DEFOLD - lint ERROR
    //export function clone_tree(node: node): any
    const clonetree: any = gui.clone_tree(node)
    let clonedNode: keyof typeof clonetree

    for (clonedNode in clonetree) {
      const clone = gui.clone(clonetree[clonedNode])
      gui.set_position(clone, nodepos)
      gui.set_visible(clone, true)

      const cloneparent: cloneparent = {
        clone: clone,
        actor: 'label',
        action: actorKey,
      }
      clones.push(cloneparent)
    }

    nodepos.y = nodepos.y + spacing * 0.5
  }
  return clones
}
export function on_message(
  this: props,
  messageId: hash,
  message: {
    actions: { [key: string]: string[] }
    pos: vmath.vector3
    npcname: string
    //room: string
    //enter: boolean
  },
  _sender: url
): void {
  if (messageId == hash('shownode')) {
    //populate text nodes && show them
    print('show node?')
    //for (actorKey in actorsActions) {
    // }
    this.clones = set_interactions(message.actions, message.pos) //GO.pos cannot come from gui script
    // this.room = message.room
    // print('message.room', message.room)
    // print('this.room', this.room)

    //this.script = message.script
    this.npcname = message.npcname
    if (npcs.all[this.npcname] != null) {
      this.isNpc = true
    } else {
      this.isNpc = false
    }
  } /**else if (messageId == hash('reload_script') && this.npcname != null) {
    //const station = npcs.all[this.npcname].currentstation
    //this.script = novel.script_builder(this.npcname, this.room, station, null, false)
  }**/ else if (messageId == hash('hidenode')) {
    //let clone: keyof typeof this.clones

    for (const clone of this.clones) {
      gui.delete_node(clone.clone)
    }
    this.clones = []
    this.watcher = ''
  }
  /** 
	}else if( messageId == hash("updatenode") ){
		const node = gui.get_node(this.selectedGui)
		if (message.position ){ gui.set_position(node, message.position) }

	}else if( messageId == hash("testjpf") ){
		print("testjpf msg?")
	}
			*/
}

export function on_input(
  this: props,
  action_id: hash,
  action: { released: true; x: number; y: number }
) {
  if (action_id == hash('touch') && action.released) {
    print(this.npcname, 'is ther an npc name testjpf?')
    check_nodes(this, action)
  }
}
