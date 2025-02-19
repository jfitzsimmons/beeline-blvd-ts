/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Game } from './states/game'
import { gamesave, gamesettings } from '../types/legacylua'
import { url } from '../types/utils'

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
  this.inGame = false
  this.currentProxy = null
  this.loadType = 'run'

  gamesave.init() // checks if theres app support data and if you're out of save slots
  gamesettings.init() // checks if menu settings file, creates new or reads
  msg.post('#', 'acquire_input_focus')
  msg.post('#', 'show_menu')
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    enterRoom: string
    loadType: string
  },
  _sender: url
): void {
  //PICK_ROOM
  if (messageId == hash('pick_room')) {
    print('GCpick_room::', message.enterRoom)
    this.roomName = message.enterRoom
    this.inGame = true
    this.loadType = message.loadType

    handleGameFSMs(this.loadType)
    show(this.currentProxy, '#' + this.roomName)
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
      print('--- === ::: NEW ROOM LOADED ::: === ---')
      msg.post(this.roomName + ':/shared/scripts#level', 'room_load', params)
    }
    msg.post(_sender, 'enable')
  }
  //SHOW_MENU
  else if (messageId == hash('show_menu')) {
    this.inGame = false
    // should eventually change game state fsm // testjpf
    show(this.currentProxy, '#main_menu')
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
    if (this.inGame == false) {
      //back to game without interruption or changing state.
      const params = {
        enterRoom: this.roomName,
        loadType: 'return to game',
      }
      msg.post('#', 'pick_room', params)
    } else {
      msg.post('#', 'show_menu')
    }
  } else if (actionId == hash('info_gui') && action.released) {
    msg.post('#', 'toggle_info')
  } else if (actionId == hash('pinball') && action.released) {
    msg.post('proxies:/controller#pinballcontroller', 'show_pinball')
  }
}
