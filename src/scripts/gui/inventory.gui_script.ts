/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//const world = require "main.states.worldstate"
//const utils = require "main.utils.utils"
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { inventoryLookup } from '../systems/inventorysystem'

const { player, npcs, rooms, novel } = globalThis.game.world
interface props {
  actorinventory: string[]
  watcher: string
  //character: boolean
  //room: string
  actorname: string
  timer: any
}
export function init(this: props) {
  this.actorinventory = []
  this.watcher = ''
}

function add_item_player(item: string) {
  player.inventory.push(item)
  player.add_inventory_bonus(item)
}

function remove_item_player(item: string) {
  const itemIndex = player.inventory.indexOf(item)
  const removed = player.inventory.splice(itemIndex, 1)
  player.add_inventory_bonus(removed[0])
}

function add_item_actor(actor: string, room: string, inv_item: string) {
  if (npcs.all[actor] != null) {
    npcs.all[actor].inventory[npcs.all[actor].inventory.length] = inv_item
    npcs.all[actor].add_inventory_bonus(inv_item)
  } else {
    rooms.all[room].actors[actor].inventory[
      rooms.all[room].actors[actor].inventory.length
    ] = inv_item
  }
}

function remove_item_actor(actor: string, room: string, item: string) {
  if (npcs.all[actor] != null) {
    const itemIndex = npcs.all[actor].inventory.indexOf(item)
    const removed = npcs.all[actor].inventory.splice(itemIndex, 1)
    npcs.all[actor].remove_inventory_bonus(removed[0])
  } else {
    const itemIndex = rooms.all[room].actors[actor].inventory.indexOf(item)
    itemIndex > -1
      ? rooms.all[room].actors[actor].inventory.splice(itemIndex, 1)
      : false
  }
}

function hide_inventory_animation(node: node) {
  gui.animate(
    node,
    gui.PROP_COLOR,
    vmath.vector4(1, 1, 1, 0),
    gui.EASING_OUTQUAD,
    0.2
  )
  timer.delay(0.3, false, function () {
    gui.play_flipbook(node, 'empty')
    gui.animate(
      node,
      gui.PROP_COLOR,
      vmath.vector4(1, 1, 1, 1),
      gui.EASING_OUTQUAD,
      0.2
    )
  })
}

function show_inventory_animation(actor_inv: string[], beneficiary: string) {
  let endNode = {}
  if (beneficiary == 'npc') {
    endNode = gui.get_node('slotb' + actor_inv.length)
  } else {
    endNode = gui.get_node('slot' + player.inventory.length)
  }
  gui.set_color(endNode, vmath.vector4(1, 1, 1, 0))
  timer.delay(0.3, false, function () {
    gui.animate(
      endNode,
      gui.PROP_COLOR,
      vmath.vector4(1, 1, 1, 1),
      gui.EASING_INQUAD,
      0.2
    )
  })
}

function show_icons(inventory: string[], slots: string) {
  const endNode = gui.get_node(slots + (inventory.length + 1))
  gui.play_flipbook(endNode, 'empty')
  let count = 1
  for (const item of inventory) {
    const node = gui.get_node(slots + count)
    gui.set_texture(node, 'chestitems')
    gui.play_flipbook(node, item)
    count++
  }
}

function load_inventory_sprites(
  actor_inv: string[],
  actor: string | null = null
) {
  if (actor == null || actor == 'player') {
    show_icons(player.inventory, 'slot')
  }
  if (actor == null || actor == 'npc') {
    show_icons(actor_inv, 'slotb')
  }
  if (actor != null && actor_inv.length > 0) {
    show_inventory_animation(actor_inv, actor)
  }
}

function choose_inventory(actorname: string) {
  //
  if (npcs.all[actorname] !== null) {
    //

    return npcs.all[actorname].inventory
  } else {
    return rooms.all[player.currentroom].actors[actorname].inventory
  }
}

function check_inventory_nodes(
  actorname: string,
  action: { x: number; y: number }
) {
  for (let i = 1; i < 31; i++) {
    let slotnum = i
    let slotname = 'slot'
    let beneficiary = 'npc'
    let debtor = 'player'
    if (i > 20) {
      slotnum = i - 20
      slotname = slotname + 'b'
      beneficiary = 'player'
      debtor = 'npc'
    }
    slotname = slotname + slotnum

    const node = gui.get_node(slotname)

    const textureHash = gui.get_flipbook(node)
    // this is getting the node name "slot..."
    if (
      gui.pick_node(node, action.x, action.y) &&
      textureHash != hash('empty')
    ) {
      const item = inventoryLookup[hash_to_hex(textureHash)]
      novel.item = item
      if (npcs.all[actorname] != null) novel.npc = npcs.all[actorname]
      hide_inventory_animation(node)

      if (i < 21) {
        add_item_actor(actorname, player.currentroom, item)
        remove_item_player(item)
      } else {
        add_item_player(item)
        remove_item_actor(actorname, player.currentroom, item)
      }

      const inventory: string[] = choose_inventory(actorname)
      load_inventory_sprites(inventory, beneficiary)
      timer.delay(0.3, false, function () {
        if (debtor == 'player') {
          show_icons(player.inventory, 'slot')
        } else {
          show_icons(inventory, 'slotb')
        }
      })
      break
    }
  }
}

function reset_prop_gui() {
  for (let i = 10; i-- !== 1; ) {
    const slotname = 'slotb' + i
    const node = gui.get_node(slotname)
    gui.play_flipbook(node, 'empty')
  }
}

function reset_nodes() {
  reset_prop_gui()
  for (let i = 21; i-- !== 1; ) {
    const slotname = 'slot' + i
    const node = gui.get_node(slotname)
    gui.play_flipbook(node, 'empty')
  }
}

function exit_inventory(actorname: string, actorinventory: string[]) {
  gui.set_enabled(gui.get_node('btm'), false)

  if (npcs.all[actorname] != null) {
    npcs.all[actorname].inventory = actorinventory
  } else {
    rooms.all[player.currentroom].actors[actorname].inventory = actorinventory
  }

  reset_nodes()
  msg.post('/shared/guis#inventory', 'release_input_focus')
  msg.post('/shared/scripts#level', 'exit_gui')
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    watcher: string
    actorname: string
    action: string
  },
  _sender: url
): void {
  if (messageId == hash('opened_chest')) {
    const inventory_node = gui.get_node('btm')
    const name_node = gui.get_node('propname')
    this.watcher = message.watcher
    this.actorname = message.actorname //npc or prop name
    this.actorinventory = choose_inventory(this.actorname)

    load_inventory_sprites(this.actorinventory)

    if (message.action != 'give') {
      gui.set_enabled(gui.get_node('propinventory'), true)
    } else {
      gui.set_enabled(gui.get_node('propinventory'), false)
    }
    gui.set_text(name_node, this.actorname)
    gui.set_enabled(inventory_node, true)
    msg.post('/shared/guis#inventory', 'acquire_input_focus')
  }
}

export function on_input(
  this: props,
  action_id: hash,
  action: { released: true; x: number; y: number }
) {
  if (action_id == hash('touch') && action.released) {
    if (gui.pick_node(gui.get_node('exit'), action.x, action.y)) {
      exit_inventory(this.actorname, this.actorinventory)
    } else {
      check_inventory_nodes(this.actorname, action)

      if (this.watcher != '' && this.watcher != null) {
        msg.post('/shared/guis#inventory', 'release_input_focus')
        timer.delay(0.9, false, function (this: props) {
          exit_inventory(this.actorname, this.actorinventory)
        })
      }
    }
  }
}
