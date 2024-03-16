/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//const world = require "main.states.worldstate"
//const utils = require "main.utils.utils"
// eslint-disable-next-line @typescript-eslint/no-var-requires
import {
  inventoryLookup,
  add_chest_bonus,
  remove_chest_bonus,
} from '../systems/inventorysystem'

const { player, npcs, rooms } = globalThis.game.world
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
  print('additem player : item::', item)
  player.state.inventory[player.state.inventory.length] = item
  add_chest_bonus(player.state, item)
}

function remove_item_player(item: string) {
  print('REMitem player : item::', item)

  const itemIndex = player.state.inventory.indexOf(item)
  print('REMitem PLayer : itemIndex::', itemIndex)

  const removed = player.state.inventory.splice(itemIndex, 1)
  print('removed[0] PLAYER::', removed[0])

  //const index = utils.get_index(player.state.inventory,item)
  //table.remove(player.state.inventory, index)
  remove_chest_bonus(player.state, removed[0])
}

function add_item_actor(actor: string, room: string, inv_item: string) {
  print('additem ACTIR : item::', inv_item)

  if (npcs.all[actor] != null) {
    npcs.all[actor].inventory[npcs.all[actor].inventory.length] = inv_item
    add_chest_bonus(npcs.all[actor], inv_item)
  } else {
    rooms.all[room].actors[actor].inventory[
      rooms.all[room].actors[actor].inventory.length
    ] = inv_item
  }
}

function remove_item_actor(actor: string, room: string, item: string) {
  print('REMitem actoR : item::', item)

  if (npcs.all[actor] != null) {
    const itemIndex = npcs.all[actor].inventory.indexOf(item)
    print('REMitem actoR : itemIndex::', itemIndex)
    const removed = npcs.all[actor].inventory.splice(itemIndex, 1)
    print('removed[0]', removed[0])
    remove_chest_bonus(npcs.all[actor], removed[0])
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
  print('pretimer')
  timer.delay(0.3, false, function () {
    print('intimer')
    gui.play_flipbook(node, 'empty')
    gui.animate(
      node,
      gui.PROP_COLOR,
      vmath.vector4(1, 1, 1, 1),
      gui.EASING_OUTQUAD,
      0.2
    )
  })
  print('posttimer')
}

function show_inventory_animation(actor_inv: string[], beneficiary: string) {
  let endNode = {}
  if (beneficiary == 'npc') {
    endNode = gui.get_node('slotb' + actor_inv.length)
  } else {
    endNode = gui.get_node('slot' + player.state.inventory.length)
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
    show_icons(player.state.inventory, 'slot')
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
    return rooms.all[player.state.currentroom].actors[actorname].inventory
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
    // const texture = gui.get_flipbook(node)
    //testjpf texture is has, your using has to get string key
    //for remove_item_player.
    //add hash prop to initStates. reverse of how you had it.
    //get id?? still hash!!!???
    const textureHash = gui.get_flipbook(node)
    // tihis is getting the node name "slot..."
    if (
      gui.pick_node(node, action.x, action.y) &&
      textureHash != hash('empty')
    ) {
      //    let tKey: keyof typeof inventoryLookup
      //      for (tKey in inventoryLookup) {
      //       print('testjpf tkey:', tKey)
      //   }
      print(textureHash, 'pre-hash-lookup testjpf')
      const item = inventoryLookup[hash_to_hex(textureHash)]
      hide_inventory_animation(node)

      if (i < 21) {
        add_item_actor(actorname, player.state.currentroom, item)
        remove_item_player(item)
      } else {
        add_item_player(item)
        remove_item_actor(actorname, player.state.currentroom, item)
      }

      const inventory: string[] = choose_inventory(actorname)
      load_inventory_sprites(inventory, beneficiary)
      timer.delay(0.3, false, function () {
        if (debtor == 'player') {
          show_icons(player.state.inventory, 'slot')
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
    rooms.all[player.state.currentroom].actors[actorname].inventory =
      actorinventory
  }

  reset_nodes()
  msg.post('inventories#inventory', 'release_input_focus')
  msg.post('level#level', 'exit_gui')
}

/**
 * testjpf dont think i need character, actorinventory
 */
export function on_message(
  this: props,
  messageId: hash,
  message: {
    watcher: string
    actorname: string
    //  room: string
    action: string
    //enter: boolean
  },
  _sender: url
): void {
  if (messageId == hash('opened_chest')) {
    const inventory_node = gui.get_node('btm')
    const name_node = gui.get_node('propname')

    // this.room = message.room
    // print(this.room, '<--THIS.ROOM testjpf')
    this.watcher = message.watcher
    this.actorname = message.actorname //npc or prop name

    //
    this.actorinventory = choose_inventory(this.actorname)

    load_inventory_sprites(this.actorinventory)

    //show actor inventory?
    if (message.action != 'give') {
      gui.set_enabled(gui.get_node('propinventory'), true)
    } else {
      gui.set_enabled(gui.get_node('propinventory'), false)
    }
    gui.set_text(name_node, this.actorname)
    gui.set_enabled(inventory_node, true)
    msg.post('inventories#inventory', 'acquire_input_focus')
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

      // only choose one inventory item?
      if (this.watcher != '' && this.watcher != null) {
        msg.post('inventories#inventory', 'release_input_focus')
        timer.delay(0.9, false, function (this: props) {
          exit_inventory(this.actorname, this.actorinventory)
        })
      }
    }
  }
}
