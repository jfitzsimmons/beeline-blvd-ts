/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

const { npcs, novel } = globalThis.game.world

interface cloneparent {
  clone: node
  actor: string
  action: string
}

interface props {
  npcname: string
  clones: cloneparent[]
  station: string
  isNpc: boolean
  novelreason: string
}

export function init(this: props): void {
  print('MINIINITNITMINIMINIINIT')
  this.npcname = ''
  this.clones = []
  this.station = ''
  this.novelreason = ''
}

/**
function open_novel(_this: props) {
  npcs.all[_this.npcname].convos = npcs.all[_this.npcname].convos + 1
  novel.npc = npcs.all[_this.npcname]
  novel.reason = _this.novelreason
  novel.forced = false

  msg.post('worldproxies:/controller#novelcontroller', 'show_scene')
  msg.post('#', 'release_input_focus')
}
*/
function check_nodes(
  _this: props,
  action: { released: boolean; x: number; y: number }
) {
  novel.forced = false
  // _this.consequence = { pass: false, type: 'neutral' }
  for (const c of _this.clones) {
    if (
      gui.get_layer(c.clone) != hash('unclickable') &&
      gui.pick_node(c.clone, action.x, action.y)
    ) {
      print("talkprint('intnovelpriority', novel.forced)", novel.forced)
      //  open_novel(_this)
    }
  }
}
//TESTJPF
//I need one clickable node that i clone and change the text of.??
//JUST LIKE you do with label!!
//let node: node = gui.get_node('_text_label')
//gui.set_text(node, actorKey)
//node = gui.get_node('label')
// what does click look for? action prop that I added!!! array sent from actor
//really could just be one link. or highligh TALK.  or somethig new like a label Urgent, with actions underneath.?
// would be cool to have a tiny interact that show preview icons of these URGENT actions.
// urgent isn't the best word for it.
//if i get this working need to overhaul dialog system
function set_interactions(
  behaviors: string[],
  pos: vmath.vector3 //go pos must come from script
): cloneparent[] {
  const clones = []
  const spacing = 25
  //const [ww, wh] = window.get_size()
  //const cw = ww / 2
  //const ch = wh / 2
  //const adjx = (cw - pos.x) / 6 + cw
  //const adjy = (ch - pos.y) / 6 + ch

  let nodepos = vmath.vector3(pos.x, pos.y, pos.z)
  // let actorKey: keyof typeof actorsActions
  for (const b of behaviors) {
    nodepos.y = nodepos.y + spacing
    nodepos = vmath.vector3(nodepos)
    print(b)
    const parent = gui.clone(gui.get_node('generic'))
    gui.set_id(parent, b)
    //  let node: node = gui.get_node('_text_generic')
    const bg = gui.clone(gui.get_node('_bg_generic'))
    gui.set_parent(bg, parent)
    const child = gui.clone(gui.get_node('_text_generic'))
    gui.set_text(child, b)
    gui.set_parent(child, parent)
    const clonetree = gui.clone_tree(parent)

    let clonedNode: keyof typeof clonetree
    for (clonedNode in clonetree) {
      const clone = gui.clone(clonetree[clonedNode])
      gui.set_position(clone, nodepos)
      gui.set_visible(clone, true)
      gui.set_xanchor(clone, gui.ANCHOR_LEFT)
      gui.set_yanchor(clone, gui.ANCHOR_TOP)

      const cloneparent: cloneparent = {
        clone: clone,
        actor: b,
        action: b,
      }
      clones.push(cloneparent)
    }
  }
  nodepos.y = nodepos.y + spacing * 1.3
  nodepos.x = nodepos.x - 25

  return clones
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    actions: string[]
    pos: vmath.vector3
    npcname: string
  },
  _sender: url
): void {
  if (messageId == hash('showmini')) {
    print('SHOWMINIMNISHowMiNi')
    //populate text nodes && show them
    this.clones = set_interactions(message.actions, message.pos) //GO.pos cannot come from gui script
    this.npcname = message.npcname
    if (npcs.all[this.npcname] != null) {
      this.isNpc = true
    } else {
      this.isNpc = false
    }
  } else if (messageId == hash('hidemini')) {
    for (const clone of this.clones) {
      gui.delete_node(clone.clone)
    }
    this.clones = []
    //this.watcher = ''
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
