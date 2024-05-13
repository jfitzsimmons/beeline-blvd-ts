/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
math.randomseed(os.time())

import { Game } from '../states/gamesystem2'
//const save = require('../../../main/states/gamesave.lua')
import { gamesave, gamesettings } from '../../types/legacylua'

interface props {
  is_level: boolean
  roomname: string
  storagename: string
  current_proxy: url | null
  load_type: string
}

function handle_new_turn(load_type: string) {
  if (load_type === 'room transition') {
    globalThis.game.world.clock = globalThis.game.world.clock + 1
    if (globalThis.game.world.clock > 23) {
      globalThis.game.world.clock = globalThis.game.world.clock - 24
    }
  } else if (load_type === 'new game') {
    globalThis.game = new Game()
  }
}
interface url {
  fragment: hash
}

function show(current_proxy: url | null, p: string) {
  if (current_proxy) {
    msg.post(current_proxy, 'unload')
    current_proxy = null
  }
  msg.post(p, 'async_load')
}

export function init(this: props) {
  this.is_level = false
  //init from bootstrap (main.collection)
  this.current_proxy = null
  this.load_type = 'none'

  gamesave.init() // checks if theres app support data and if you're out of save slots
  gamesettings.init() // checks if menu settings file, creates new or reads
  msg.post('#', 'acquire_input_focus')
  msg.post('#', 'show_menu')
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    enter_room: string
    load_type: string
  },
  _sender: url
): void {
  if (messageId == hash('show_menu')) {
    this.is_level = false
    show(this.current_proxy, '#main_menu')
  } else if (messageId == hash('toggle_info')) {
    this.is_level = false
    // show(this.current_proxy, '#info_gui')
    msg.post('proxies:/controller#infocontroller', 'toggle_info')
  } else if (messageId == hash('faint')) {
    globalThis.game.world.clock = globalThis.game.world.clock + 6
    globalThis.game.world.player.ap = globalThis.game.world.player.ap_max - 6
    msg.post('#', 'pick_room', message)
  } else if (messageId == hash('arrested')) {
    globalThis.game.world.clock = globalThis.game.world.clock + 6
    globalThis.game.world.player.alert_level = 0
    globalThis.game.world.player.ap = globalThis.game.world.player.ap_max - 6
    msg.post('#', 'pick_room', message)
  } else if (messageId == hash('pick_room')) {
    this.roomname = message.enter_room
    this.is_level = true
    this.load_type = message.load_type
    // print('--- === ::: NEW ROOM LOADED ::: === ---')
    handle_new_turn(this.load_type)
    show(this.current_proxy, '#' + this.roomname)
  } else if (messageId == hash('proxy_loaded')) {
    this.current_proxy = _sender
    if (this.current_proxy !== null && this.is_level == true) {
      const params = {
        roomname: this.roomname,
        load_type: this.load_type,
      }
      msg.post(this.roomname + ':/shared/scripts#level', 'room_load', params)
    }

    msg.post(_sender, 'enable')
  }
}

export function on_input(
  this: props,
  action_id: hash,
  action: {
    released: boolean
  }
) {
  if (action_id == hash('main_menu') && action.released) {
    if (this.is_level == false) {
      //back to game without interruption or changing state.
      const params = {
        enter_room: this.roomname,
        load_type: 'return to game',
      }
      msg.post('#', 'pick_room', params)
    } else {
      msg.post('#', 'show_menu')
    }
  } else if (action_id == hash('info_gui') && action.released) {
    msg.post('#', 'toggle_info')
  }
}
