/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Game } from './states/game'
//import { gamesave, gamesettings } from '../types/legacylua'
import { url } from '../types/utils'

/**
 * TESTJPF
 * I think the problem is
 * this is both a game controller and a world controller
 * need to separate and assignment assert world
 * the GC need MVP to set
 * game.fsm.setSate('new') to trigger new World()
 * later:: save, load, settings
 * that means main.collection needs to point to
 * world.collection (create) with it's own controller
 */

globalThis.game = new Game()
const game = globalThis.game
const { world } = game
const { rooms, player, npcs } = world

interface props {
  inGame: boolean
  roomName: string
  storagename: string
  currentProxy: url | null
  loadType: string
}

function handleGameFSMs(loadType: string) {
  print('!!! --- === ::: Updating State ::: === --- !!!')
  if (loadType === 'room transition') {
    world.fsm.setState('turn')
    npcs.fsm.setState('place')
  } else if (loadType === 'faint') {
    world.fsm.setState('faint')
  } else if (loadType === 'arrest') {
    world.fsm.setState('arrest')
  } else if (loadType === 'new game') {
    game.fsm.setState('new')
    world.fsm.setState('turn')
  }
}

function show(currentProxy: url | null, p: string) {
  if (currentProxy) {
    msg.post(currentProxy, 'unload')
    currentProxy = null
  }
  msg.post(p, 'async_load')
}

//init from bootstrap (main.collection)
export function init(this: props) {
  this.inGame = true
  this.currentProxy = null
  this.loadType = 'run'
  this.roomName = 'admin1'
  print('WORLDINITFOCUS')
  //msg.post('#', 'acquire_input_focus')
  //msg.post('#', 'show_menu')
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    roomName: string
    loadType: string
  },
  _sender: url
): void {
  //PICK_ROOM
  if (messageId == hash('pick_room')) {
    print('GCpick_room::', message.roomName, message.loadType, this.roomName)
    this.roomName = message.roomName
    this.loadType = message.loadType

    handleGameFSMs(this.loadType)
    show(this.currentProxy, '#' + this.roomName)
    msg.post('#', 'acquire_input_focus')
    this.inGame = true
  }
  //PROXY_LOADED
  else if (messageId == hash('proxy_loaded')) {
    this.currentProxy = _sender
    if (this.inGame == true && this.currentProxy !== null) {
      const params = {
        roomName: this.roomName,
        loadType: this.loadType,
      }
      rooms.all[player.currRoom].fsm.setState('blur')
      rooms.all[this.roomName].fsm.setState('focus')
      print('000 --- === ::: NEW ROOM LOADING ::: === --- 000')
      msg.post(this.roomName + ':/shared/scripts#level', 'room_load', params)
    }
    msg.post(_sender, 'enable')
  }
  //TOGGLE_INFO
  else if (messageId == hash('toggle_info')) {
    this.inGame = false
    msg.post('proxies:/controller#infocontroller', 'toggle_info')
  }
}

export function on_input(
  this: props,
  actionId: hash,
  action: {
    released: boolean
  }
) {
  if (actionId == hash('main_menu') && action.released) {
    const params = {
      roomName: this.roomName,
      loadType: this.inGame == true ? 'game paused' : 'return to game',
    }
    // this.inGame = this.inGame == true ? false : true
    msg.post('gameproxies:/controller#gamecontroller', 'show_menu', params)
  } else if (actionId == hash('info_gui') && action.released) {
    msg.post('#', 'toggle_info')
  } else if (actionId == hash('pinball') && action.released) {
    msg.post('proxies:/controller#pinballcontroller', 'show_pinball')
  }
}
