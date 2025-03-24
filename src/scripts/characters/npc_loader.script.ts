const { npcs } = globalThis.game.world

function show_npc(name: string) {
  if (name != '') {
    const npc = npcs.all[name]
    // if (npc.behavior.active.children.length > 0) {
    if (
      npc.behavior.active.children.some(
        (b) =>
          b.constructor.name == 'InjuredSequence' ||
          b.constructor.name == 'MendeeSequence'
      )
    ) {
      particlefx.play('#injury')
    } else if (npc.behavior.active.children.length > 0) {
      particlefx.play('#wanted')
    }

    const emoteLookup: { [key: string]: string } = {
      InjuredSequence: 'injured',
      MenderSequence: 'mender',
      MendeeSequence: 'mendee',
      AnnouncerSequence: 'announcer',
      AssaultedSequence: 'assaulted',
      HelperSequence: 'helper',
      QuestionSequence: 'questioning',
      RecklessSequence: 'reckless',
      SnitchSequence: 'snitch',
      PhoneSequence: 'snitch',
      SuspectingSequence: 'suspecting',
      TrespassSequence: 'trespass',
      admirer: 'admirer',
      amped: 'amped',
      angel: 'angel',
      crimewave: 'crimewave',
      devil: 'devil',
      incharge: 'incharge',
      inhiding: 'inhiding',
      inspired: 'inspired',
      loudmouth: 'loudmouth',
      modesty: 'modesty',
      opportunist: 'opportunist',
      prejudice: 'prejudice',
      rebel: 'rebel',
      vanity: 'vanity',
      yogi: 'yogi',
      distracted: 'distracted',
      readup: 'readup',
    }
    let count = 0
    //const disable = npc.behavior.active.children.length > 3 ? 4 : 0
    for (const b of npc.behavior.active.children) {
      if (emoteLookup[b.constructor.name] !== null) {
        count++
        sprite.play_flipbook(`#emote${count}`, emoteLookup[b.constructor.name])
        msg.post(`#emote${count}`, 'enable')
      }
      if (count == 3) {
        sprite.play_flipbook(`#emote${count + 1}`, 'more')
        msg.post(`#emote${count + 1}`, 'enable')
        count++
        break
      }
    }
    if (count < 4) {
      for (const e of npc.effects) {
        if (emoteLookup[e.label] !== null) {
          count++
          sprite.play_flipbook(`#emote${count}`, emoteLookup[e.label])
          msg.post(`#emote${count}`, 'enable')
        }
        if (count == 3) {
          sprite.play_flipbook(`#emote${count + 1}`, 'more')
          msg.post(`#emote${count + 1}`, 'enable')
          count++
          break
        }
      }
    }

    for (let i = 4; i > count; i--) {
      msg.post(`#emote${i}`, 'disable')
    }
    // }
    sprite.play_flipbook('#npcspritebody', npcs.all[name].body)
    sprite.play_flipbook('#npcsprite', npcs.all[name].race)
  } else {
    msg.post('#npcsprite', 'disable')
    msg.post('#npcspritebody', 'disable')

    for (let i = 4; i > 0; i--) {
      msg.post(`#emote${i}`, 'disable')
    }
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
    show_npc(this.npc)
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
    show_npc(message.npc)
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
      msg.post('/shared/adam#interact', 'hidenode')
    }
  }
}
