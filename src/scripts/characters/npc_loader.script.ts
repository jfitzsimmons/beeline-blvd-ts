//const world = require('main.states.worldstate')
const { npcs } = globalThis.game.world
function show_npc(name: string) {
  if (name != '') {
    sprite.play_flipbook('#npcsprite', name)
  } else {
    msg.post('#npcsprite', 'disable')
  }
}

export function init(this: props) {
  this.actions = {}
}
interface props {
  npc: string
  room: string
  actions: { [key: string]: string[] }
}
export function on_message(
  this: props,
  messageId: hash,
  message: { npc: string; room: string; enter: boolean },
  _sender: url
): void {
  //const senderId = go.get_id()

  if (messageId == hash('load_npc')) {
    const p = go.get_position()
    // toggle npc if present in station
    if (message.npc != '') {
      p.z = 0
      go.set_position(p)
      this.npc = message.npc
      //giving diff characters different sets of actions might be fun
      this.actions[this.npc] = npcs.all[this.npc].actions
      this.room = message.room
      //this.script = message.script
    } else {
      p.z = -100
      go.set_position(p)
      msg.post('#fluid', 'disable')
      msg.post('#solid', 'disable')
    }

    show_npc(message.npc)
  } else if (messageId == hash('show_npc')) {
    show_npc(message.npc)
  } else if (messageId == hash('trigger_response')) {
    if (message.enter) {
      const params = {
        pos: go.get_position('adam'), //must come from .script
        actions: this.actions,
        //  script: this.script,
        collision: 'enter',
        npcname: this.npc,
        room: this.room,
      }

      msg.post('adam#interact', 'shownode', params)
    } else {
      const params = {
        ['collision']: 'exit',
        ['texts']: this.actions,
      }

      msg.post('adam#interact', 'hidenode', params)
    }
  }
}
