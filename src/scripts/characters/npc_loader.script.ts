const { npcs } = globalThis.game.world

function show_npc(name: string, behaviors: string[]) {
  if (name != '') {
    const npc = npcs.all[name]
    if (
      npc.behavior.active.children.some(
        (b) =>
          b.constructor.name == 'InjuredSequence' ||
          b.constructor.name == 'MendeeSequence'
      )
    ) {
      print('000PREMSGMSGMSGMSGMSGMSGMSG')
      const params = {
        pos: go.get_position(npcs.all[name].currStation), //must come from .script
        actions: behaviors, //generated from actors
        //script:this.script,
        //collision:"enter",
        npcname: npc.name,
        //parenturl:this.url,
        //room:this.roomName
      }
      msg.post('#mini', 'showmini', params)
      particlefx.play('#injury')
    } else if (npc.behavior.active.children.length > 0) {
      particlefx.play('#wanted')

      const params = {
        pos: go.get_position(npcs.all[name].currStation), //must come from .script
        actions: behaviors, //generated from actors
        //script:this.script,
        //collision:"enter",
        npcname: npc.name,
        //parenturl:this.url,
        //room:this.roomName
      }
      print('PREMSGMSGMSGMSGMSGMSGMSG')
      msg.post('#mini', 'showmini', params)
    }
    sprite.play_flipbook('#npcspritebody', npcs.all[name].body)
    sprite.play_flipbook('#npcsprite', npcs.all[name].race)
  } else {
    msg.post('#npcsprite', 'disable')
    msg.post('#npcspritebody', 'disable')
  }
}

function move_npc(station: string, from = { x: 0, y: 0 }) {
  print('STation to move to:::', station)
  const pos = go.get_position(station)
  pos.y = pos.y - math.random(34, 94) + from.y
  pos.x = pos.x - math.random(10, 50) + from.x
  go.set_position(pos)
}

export function init(this: props) {
  this.actions = {}
  this.npc = ''
}
interface props {
  npc: string
  room: string
  actions: { [key: string]: string[] }
}
export function on_message(
  this: props,
  messageId: hash,
  message: {
    npc: string
    room: string
    enter: boolean
    station: string
    behaviors: string[]
  },
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
      //giving diff characters different sets of actions might be funn
      this.actions[this.npc] = npcs.all[this.npc].actions

      if (
        npcs.all[this.npc] != null &&
        npcs.all[this.npc].behavior.active.children.length > 0
      ) {
        const behaviors = []
        for (const behavior of npcs.all[this.npc].behavior.active.children) {
          behaviors.push(behavior.constructor.name)
        }
        this.actions.behaviors = behaviors
      }
      this.room = message.room
      //this.script = message.script
    } else {
      p.z = -100
      go.set_position(p)
      msg.post('#fluid', 'disable')
      msg.post('#solid', 'disable')
    }
    show_npc(this.npc, this.actions.behaviors)
  } else if (messageId == hash('move_npc')) {
    // print('MOVENPCmsg::', message.npc, _sender, _sender.fragment)
    let deskarea = { x: 0, y: 0 }
    if (npcs.all[message.npc].currStation == 'desk') {
      let deskpos = deskarea
      if (message.station == 'phone') {
        deskpos = go.get_position('phone')
      } else {
        deskpos = go.get_position('deskarea')
        deskpos.x = -deskpos.x
        deskpos.y = -deskpos.y
      }
      deskarea = { x: deskpos.x, y: deskpos.y }
    } else if (message.station == 'desk') {
      const deskpos = go.get_position('deskarea')
      deskarea = { x: deskpos.x, y: deskpos.y }
    } else if (message.station == 'phone') {
      const deskpos = go.get_position('deskarea')
      deskarea = { x: deskpos.x + 50, y: deskpos.y + 50 }
    }
    move_npc(message.station, deskarea)
  } else if (messageId == hash('show_npc')) {
    show_npc(message.npc, message.behaviors)
  } else if (messageId == hash('trigger_response')) {
    if (message.enter) {
      const params = {
        pos: go.get_position('/shared/adam'), //must come from .script
        actions: this.actions,
        //  script: this.script,
        collision: 'enter',
        npcname: this.npc,
        room: this.room,
      }

      msg.post('/shared/adam#interact', 'shownode', params)
    } else {
      const params = {
        ['collision']: 'exit',
        ['texts']: this.actions,
      }

      msg.post('/shared/adam#interact', 'hidenode', params)
    }
  }
}
