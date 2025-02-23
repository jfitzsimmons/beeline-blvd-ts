/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
//testjpf eslint to do
//convert two lua files to TS
import { Game } from './states/game'
import { gamesave, gamesettings } from '../types/legacylua'
import { url } from '../types/utils'

globalThis.game = new Game()

interface props {
  isPaused: boolean
  roomName: string
  storagename: string
  currentProxy: url | null
  loadType: string
}

function show(currentProxy: url | null, p: string) {
  if (currentProxy) {
    print('currprox,p', currentProxy, p)
    msg.post(currentProxy, 'unload')
    currentProxy = null
  }
  msg.post('#', 'release_input_focus')
  msg.post(p, 'async_load')
}

//init from bootstrap (main.collection)
export function init(this: props) {
  this.currentProxy = null
  this.loadType = 'game init'
  this.roomName = 'grounds'
  this.isPaused = false

  gamesave.init() // checks if theres app support data and if you're out of save slots
  gamesettings.init() // checks if menu settings file, creates new or reads
  const params = {
    roomName: this.roomName,
    loadType: this.loadType,
  }
  print('||| >>> GAME CONTROLLER INITIALIZED <<< |||')

  msg.post('#', 'show_menu', params)
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
  //PROXY_LOADED
  if (messageId == hash('proxy_loaded')) {
    this.currentProxy = _sender

    if (this.loadType === 'new game') {
      //YOU DONT WANT TO UNLOAD GAME!!! There is NO GAME PROXY!!
      //THE GAMEPROXY IS A LIE! TESTJPF
      const params = {
        roomName: 'grounds',
        loadType: 'new game',
      }
      msg.post('worldproxies:/controller#worldcontroller', 'pick_room', params)
    } else if (
      this.loadType !== 'game init' &&
      _sender.fragment !== hash('main_menu')
    ) {
      // back-to game
      const params = {
        roomName: this.roomName,
        loadType: this.loadType,
      }
      msg.post('worldproxies:/controller#worldcontroller', 'pick_room', params)
    }
    msg.post(_sender, 'enable')
  }
  //SHOW_MENU
  else if (messageId == hash('show_menu')) {
    this.roomName = message.roomName
    this.loadType = message.loadType

    show(this.currentProxy, '#main_menu')
    this.isPaused = this.isPaused === true ? false : true
    msg.post('#', 'acquire_input_focus')
  }
  //NEW_GAME
  else if (messageId == hash('new_game')) {
    this.roomName = message.roomName
    this.loadType = message.loadType

    show(this.currentProxy, '#world')
    msg.post('#', 'acquire_input_focus')
  }
}

export function on_input(
  this: props,
  actionId: hash,
  action: {
    released: boolean
  }
) {
  if (
    actionId == hash('main_menu') &&
    action.released &&
    this.isPaused == false
  ) {
    //back to game without interruption or changing state.
    show(this.currentProxy, '#world')
    this.isPaused = true
    msg.post('#', 'acquire_input_focus')
  }
}
