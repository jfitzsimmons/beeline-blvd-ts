const { rooms, npcs } = globalThis.game.world
interface props {
  actions: { [key: string]: string[] }
  roomName: string
  npc: string
  adjacent?: string
}
export function init(this: props): void {
  this.actions = {}
  this.roomName = ''
  this.npc = ''
  this.adjacent = undefined
}

function prep_interaction(_this: props) {
  const room = rooms.all[_this.roomName]
  let actors = room.props
  if (actors == undefined) actors = []
  const actions: { [key: string]: string[] } = {}

  for (const actor of actors) {
    actions[actor] = room.actors[actor].actions
  }

  if (npcs.all[_this.npc] != null) {
    actions[_this.npc] = npcs.all[_this.npc].actions
  }

  if (
    npcs.all[_this.npc] != null &&
    npcs.all[_this.npc].behavior.active.children.length > 0
  ) {
    const behaviors = []
    for (const behavior of npcs.all[_this.npc].behavior.active.children) {
      behaviors.push(behavior.constructor.name)
    }
    actions.behaviorss = behaviors
  }
  print('_this.actions = actions', actions[_this.npc])

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
    roomName: string
    adjacent?: string
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
        npcname: this.npc == '' ? 'desk' : this.npc,
        //parenturl:this.url,
        //room:this.roomName
      }
      print('TRIGGER_PARAMSs', this.actions.length)

      msg.post('/shared/adam#interact', 'shownode', params)
    } else {
      // for removing cloned nodes

      msg.post('/shared/adam#interact', 'hidenode')
    }
  } else if (messageId == hash('loadStation')) {
    this.npc = message.npc
    this.roomName = message.roomName
    this.adjacent = message.adjacent
    print(
      'loadstation!!!:::',
      message.npc,
      this.npc,
      this.roomName,
      this.adjacent
    )
    prep_interaction(this) // combine actor actions
    msg.post(
      this.adjacent == undefined
        ? `/desk#npc_loader`
        : `/${this.adjacent}desk#npc_loader`,
      'show_npc',
      {
        npc: this.npc,
      }
    )
  } else if (messageId == hash('loadActor')) {
    this.npc = ''
    this.roomName = message.roomName
    prep_interaction(this) // combine actor actions
  }
}
