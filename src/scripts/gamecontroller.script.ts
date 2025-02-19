/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
    print('is this unloaded curprox::', currentProxy, p)
    msg.post(currentProxy, 'unload')
    currentProxy = null
  }
  print('PPPPPPP::::::', p)
  msg.post('#', 'release_input_focus')
  msg.post(p, 'async_load')
}

//init from bootstrap (main.collection)
export function init(this: props) {
  this.isPaused = false
  this.currentProxy = null
  this.loadType = 'game init'
  this.roomName = 'grounds'

  gamesave.init() // checks if theres app support data and if you're out of save slots
  gamesettings.init() // checks if menu settings file, creates new or reads
  const params = {
    enterRoom: this.roomName,
    loadType: this.loadType,
  }
  msg.post('#', 'show_menu', params)
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
  //PROXY_LOADED
  if (messageId == hash('proxy_loaded')) {
    this.currentProxy = _sender

    if (_sender.fragment == hash('world')) {
      //YOU DONT WANT TO UNLOAD GAME!!! There is NO GAME PROXY!!
      //THE GAMEPROXY IS A LIE! TESTJPF

      const params = {
        enterRoom: 'grounds',
        loadType: 'new game',
      }
      msg.post('worldproxies:/controller#worldcontroller', 'pick_room', params)
    } else if (
      this.isPaused == false &&
      _sender.fragment !== hash('main_menu')
    ) {
      const params = {
        roomName: this.roomName,
        loadType: this.loadType,
      }
      print(
        'PLEASEPLEASE::: this.isPaused , this.currentProxy::',
        this.isPaused,
        this.currentProxy,
        _sender.fragment
      )
      //print('000 --- === ::: NEW ROOM LOADING ::: === --- 000')
      msg.post('worldproxies:/controller#worldcontroller', 'pick_room', params)
    }

    msg.post(_sender, 'enable')
  }
  //SHOW_MENU
  else if (messageId == hash('show_menu')) {
    this.roomName = message.enterRoom
    this.loadType = message.loadType
    this.isPaused = this.loadType === 'game paused'

    print(
      this.isPaused,
      _sender.fragment,
      this.loadType,
      'this.isPaused',
      'senderfrag',
      'loadtype'
    )

    // this.isPaused = false
    // should eventually change game state fsm // testjpf
    if (this.isPaused == false && this.loadType !== 'game init') {
      print('BACK TO GAME!!!')
      //back to game without interruption or changing state.
      const params = {
        enterRoom: this.roomName,
        loadType: 'return to game',
      }
      msg.post('worldproxies:/controller#worldcontroller', 'pick_room', params)
    } else {
      show(this.currentProxy, '#main_menu')
      msg.post('#', 'acquire_input_focus')
    }
  } else if (messageId == hash('new_game')) {
    this.roomName = message.enterRoom
    //this.isPaused = _sender.fragment == hash('worldproxies')
    this.loadType = message.loadType
    print('NERWGAME!!', this.loadType, this.roomName)

    // this.isPaused = false
    // should eventually change game state fsm // testjpf
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
  if (actionId == hash('main_menu') && action.released) {
    print('gameescapeinput')

    if (this.isPaused == true) {
      //back to game without interruption or changing state.
      show(this.currentProxy, '#world')

      const params = {
        enterRoom: this.roomName,
        loadType: 'return to game',
      }
      msg.post('worldproxies:/controller#worldcontroller', 'pick_room', params)
    }
  }
}
