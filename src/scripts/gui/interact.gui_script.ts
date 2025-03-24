import { ThiefVictimProps, AttendantProps } from '../../types/ai'
import { QuestionProps } from '../../types/behaviors'
import { Consequence } from '../../types/tasks'
import SuspectingSequence from '../behaviors/sequences/suspectingSequence'
import { witnessPlayer } from '../states/inits/checksFuncs'

const { npcs, rooms, tasks, player, novel } = globalThis.game.world

interface cloneparent {
  primary: string
  clone: node
  actor: string
  action: string
}

interface props {
  actorname: string
  clones: cloneparent[]
  watcher: string
  station: string
  consequence: Consequence
  isNpc: boolean
}

export function init(this: props): void {
  this.actorname = ''
  this.clones = []
  this.watcher = ''
  this.station = ''
  this.consequence = {
    pass: false,
    type: 'neutral',
  }
}

////function show_ai_screen() {
//msg.post('ai_screen#ai_screen', 'show_screen')
//msg.post('#', 'release_input_focus')
//}

function open_novel(_this: props) {
  npcs.all[_this.actorname].convos = npcs.all[_this.actorname].convos + 1
  novel.npc = npcs.all[_this.actorname]
  novel.reason = _this.consequence.type
  novel.forced = false

  msg.post('worldproxies:/controller#novelcontroller', 'show_scene')
  msg.post('#', 'release_input_focus')
}

function open_inventory(_this: props, actor: string, action: string) {
  const room = rooms.all[player.currRoom]
  if (action == 'open') {
    // station where the watcher will be located
    print(
      '111INTERACTGUI:::: OPENINVENTORY333::: Params',
      _this.actorname,
      _this.watcher,
      actor,
      action,
      player.currRoom
    )

    const station: string | undefined =
      actor === '' ? undefined : room.actors[actor].watcher
    // the actual npc assigned to that station
    if (station != undefined) {
      _this.watcher = room.stations[station]
    }

    if (_this.watcher === '') {
      const params = {
        actorname: actor,
        //isNpc: _this.isNpc,
        watcher: _this.watcher,
        action: action,
      }
      // prettier-ignore
      print('INTERACTGUI:::: OPENINVENTORY333::: Params',_this.actorname,_this.watcher,params.actorname,params.action,params.watcher,player.currRoom
      )

      msg.post('/shared/guis#inventory', 'opened_chest', params)
      msg.post('#', 'release_input_focus')
    }
  } else if (action == 'trade' || action == 'give' || action == 'pockets') {
    // testjpf trade will need "acceptanace"????
    _this.watcher = actor
  }
  if (_this.watcher != '' && _this.watcher != null) {
    novel.npc = npcs.all[_this.watcher]

    const prev_caution = tasks.npcHasTask([_this.watcher], ['player'])

    if (prev_caution != null) {
      _this.consequence = { pass: true, type: 'offender' }
    } else if (action == 'pockets' || action == 'open') {
      const thiefprops: ThiefVictimProps = {
        name: player.name,
        addInvBonus: player.addInvBonus.bind(player),
        removeInvBonus: player.removeInvBonus.bind(player),
        updateInventory: player.updateInventory.bind(player),
        addOrExtendEffect: player.addOrExtendEffect.bind(player),
        traits: player.traits,
        inventory: player.inventory,
        cooldown: player.cooldown,
        clan: player.clan,
        crime: action === 'open' ? 'concern' : action,
      }
      const watcher = npcs.all[_this.watcher]
      const watcherProps: AttendantProps = {
        name: watcher.name,
        traits: watcher.traits,
        clan: watcher.clan,
        inventory: watcher.inventory,
        updateInventory: watcher.updateInventory.bind(watcher),
        addOrExtendEffect: watcher.addOrExtendEffect.bind(watcher),
      }
      _this.consequence = witnessPlayer(thiefprops, watcherProps)
    } else if (action == 'give' || action == 'trade') {
      const params = {
        actorname: actor,
        //isNpc: _this.isNpc,
        watcher: _this.watcher,
        action: action,
      }
      msg.post('/shared/guis#inventory', 'opened_chest', params)
      msg.post('#', 'release_input_focus')
      _this.consequence = { pass: false, type: 'neutral' }
    } else {
      _this.consequence = { pass: false, type: 'neutral' }
    }
  }
  if (_this.consequence.pass == true) {
    if (_this.isNpc == false) _this.actorname = _this.watcher
    // player.fsm.setState('confronted')
    //TESTJPF NEW
    //should create confrontSeq?confronted?
    //should do something where it picks a random person on screen
    // and runs their acions
    // each interaction, player loses an option
    /**
     * could unshift a SuspiciousSeq
     * trigger that npc's active.run
     * postpone or delete any of that npcs other active behaviors?
     * burning that opportunity
     * you could use that as a favor for othe npcs they may have
     * messed wiht durin that turn!!!
     */
    const watcher = npcs.all[_this.watcher]

    watcher.addToBehavior(
      'active',
      new SuspectingSequence(
        watcher.getBehaviorProps.bind(watcher),
        player.getBehaviorProps('question') as QuestionProps,
        action == 'open' ? 'concern' : action,
        _this.isNpc == false ? room.actors[actor] : undefined
      ),
      true
    )
    watcher.behavior.active.run()

    // open_novel(_this)
  } else {
    const params = {
      actorname: actor,
      watcher: _this.watcher,
      action: action,
    }
    msg.post('/shared/guis#inventory', 'opened_chest', params)
    msg.post('#', 'release_input_focus')
  }
}
function check_nodes(
  _this: props,
  action: { released: boolean; x: number; y: number }
) {
  novel.forced = false
  _this.consequence = { pass: false, type: 'neutral' }
  print('_this.clones.length', _this.clones.length)
  for (const c of _this.clones) {
    print('gui.get_layer(c.clone)', c.actor, c.action, gui.get_layer(c.clone))
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
        break
      } else if (c.action == 'talk') {
        print("talkprint('intnovelpriority', novel.forced)", novel.forced)
        open_novel(_this)
        break
      } else if (c.action == 'use') {
        // show_ai_screen()
        break
      }
    }
  }
}
function set_interactions(m: {
  actions: { [key: string]: string[] }
  pos: vmath.vector3
  npcname: string
}): cloneparent[] {
  const clones = []
  const spacing = 25
  const [ww, wh] = window.get_size()
  const cw = ww / 2
  const ch = wh / 2
  const adjx = (cw - m.pos.x) / 6 + cw
  const adjy = (ch - m.pos.y) / 6 + ch

  let nodepos = vmath.vector3(adjx, adjy, m.pos.z)
  let actorKey: keyof typeof m.actions
  for (actorKey in m.actions) {
    for (let i = m.actions[actorKey].length; i-- !== 0; ) {
      const action = m.actions[actorKey][i]
      nodepos.y = nodepos.y + spacing
      nodepos = vmath.vector3(nodepos)

      const node = gui.clone(gui.get_node('generic'))
      const text = gui.clone(gui.get_node('_text_generic'))
      const bg = gui.clone(gui.get_node('_bg_generic'))
      gui.set_id(node, actorKey + action)
      gui.set_parent(bg, node)
      gui.set_text(text, action)
      gui.set_parent(text, node)
      gui.set_visible(bg, true)
      gui.set_visible(text, true)
      gui.set_visible(node, true)
      gui.set_position(node, nodepos)

      const cloneparent: cloneparent = {
        primary: m.npcname,
        clone: node,
        actor: actorKey,
        action,
      }
      clones.push(cloneparent)
      print('actorKey + action', actorKey + action)
    }
    nodepos.y = nodepos.y + spacing * 1.3
    nodepos.x = nodepos.x - 16

    const node = gui.clone(gui.get_node('label'))
    const text = gui.clone(gui.get_node('_text_label'))
    const bg = gui.clone(gui.get_node('_bg_label'))
    gui.set_id(node, actorKey + 'label')
    gui.set_parent(bg, node)
    gui.set_text(text, actorKey)
    gui.set_parent(text, node)
    gui.set_visible(bg, true)
    gui.set_visible(text, true)
    gui.set_visible(node, true)
    gui.set_position(node, nodepos)

    //TS-DEFOLD - lint ERROR
    //export function clone_tree(node: node): any
    const cloneparent: cloneparent = {
      primary: m.npcname,
      clone: node,
      actor: actorKey,
      action: 'label',
    }
    clones.push(cloneparent)

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
  },
  _sender: url
): void {
  if (messageId == hash('shownode')) {
    this.isNpc = npcs.all[message.npcname] != null
    this.actorname = message.npcname
    this.watcher = ''

    for (let i = this.clones.length; i-- !== 0; ) {
      if (this.clones[i].primary !== message.npcname) {
        print(
          'this.clones[i].primary !== message.npcname',
          this.clones[i].primary !== message.npcname,
          this.clones[i].actor,
          message.npcname
        )
        gui.delete_node(this.clones[i].clone)
        this.clones.splice(i, 1)
      }
    }

    //populate text nodes && show them
    this.clones = set_interactions(message) //GO.pos cannot come from gui script
  } else if (messageId == hash('hidenode')) {
    for (let i = this.clones.length; i-- !== 0; ) {
      print(i, '222this.clones[i].primary', this.clones[i].primary)
      if (this.clones[i].primary == this.actorname) {
        gui.delete_node(this.clones[i].clone)
        this.clones.splice(i, 1)
      }
    }
    this.watcher = ''
  }
}

export function on_input(
  this: props,
  actionId: hash,
  action: { released: true; x: number; y: number }
) {
  if (actionId == hash('touch') && action.released) {
    check_nodes(this, action)
  }
}
