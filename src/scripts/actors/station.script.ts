//const world = require "main.states.worldstate"
//const utils = require "main.utils.utils"
const { rooms, npcs } = globalThis.game.world
interface props {
  actions: { [key: string]: string[] }
  roomname: string
  npc: string
}
export function init(this: props): void {
  this.actions = {}
  this.roomname = ''
  this.npc = ''
}

function prep_interaction(_this: props) {
  const room = rooms.all[_this.roomname]
  let actors = room.props
  if (actors == undefined) actors = []
  const actions: { [key: string]: string[] } = {}

  for (const actor of actors) {
    actions[actor] = room.actors[actor].actions
  }

  if (npcs.all[_this.npc] != null) {
    actions[_this.npc] = npcs.all[_this.npc].actions
  }

  _this.actions = actions
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    npc: string
    enter: boolean
    exit: boolean
    storagename: string
    roomname: string
  },
  _sender: url
): void {
  if (messageId == hash('trigger_response')) {
    // <2>
    if (message.enter) {
      // <3>
      const params = {
        pos: go.get_position('/shared/adam'), //must come from .script
        actions: this.actions, //generated from actors
        //script:this.script,
        //collision:"enter",
        npcname: this.npc,
        //parenturl:this.url,
        //room:this.roomname
      }
      msg.post('/shared/adam#interact', 'shownode', params)
    } else {
      // for removing cloned nodes
      const params = { texts: this.actions }

      msg.post('/shared/adam#interact', 'hidenode', params)
    }
  } else if (messageId == hash('load_station')) {
    this.npc = message.npc //this.url = rooms.all[message.roomname].stationurl
    this.roomname = message.roomname
    prep_interaction(this) // combine actor actions
    msg.post('/npc_loader#npc_loader', 'show_npc', { npc: this.npc })
  }
}
