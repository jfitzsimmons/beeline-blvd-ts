/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { url } from '../types/utils'

const game = globalThis.game
const { world } = game
const { rooms, player } = world

interface props {
  inGame: boolean
  roomName: string
  storagename: string
  currentProxy: url | null
  loadType: string
  isPaused: boolean
}

function handleGameFSMs(loadType: string) {
  print('!!! --- === ::: World State Transitions ::: === --- !!!', loadType)
  if (loadType === 'room transition') {
    world.fsm.setState('turn')
  } else if (loadType === 'faint') {
    world.fsm.setState('faint')
  } else if (loadType === 'arrest') {
    world.fsm.setState('arrest')
  } else if (loadType === 'new game') {
    game.fsm.setState('new')
  }
}

function show(currentProxy: url | null, p: string) {
  if (currentProxy) {
    msg.post(currentProxy, 'unload')
    currentProxy = null
  }
  msg.post(p, 'async_load')
}

//init from  (world.collection)
export function init(this: props) {
  print('|| >>> WORLD CONTROLLER INITIALIZED <<< ||')
  this.currentProxy = null
  this.loadType = 'run'
  this.roomName = 'admin1'
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
    this.roomName = message.roomName
    this.loadType = message.loadType
    handleGameFSMs(this.loadType)
    show(this.currentProxy, '#' + this.roomName)
    msg.post('#', 'acquire_input_focus')
  }
  //PROXY_LOADED
  else if (messageId == hash('proxy_loaded')) {
    this.currentProxy = _sender
    if (this.currentProxy !== null) {
      const params = {
        roomName: this.roomName,
        loadType: this.loadType,
      }
      rooms.all[player.currRoom].fsm.setState('blur')
      rooms.all[this.roomName].fsm.setState('focus')
      print(
        '000 --- === ::: NEW ROOM LOADING ::: === --- 000',
        this.isPaused,
        this.loadType
      )

      msg.post(
        this.roomName + ':/shared/scripts#level',
        this.loadType === 'game paused' ? 'quick_load' : 'room_load',
        params
      )
      this.isPaused = false
    }
    msg.post(_sender, 'enable')
  }
  //TOGGLE_INFO
  else if (messageId == hash('toggle_info')) {
    //this.inGame = false
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
  if (
    actionId == hash('main_menu') &&
    action.released &&
    this.isPaused == false
  ) {
    this.isPaused = true
    const params = {
      roomName: this.roomName,
      loadType: 'game paused',
    }
    msg.post('gameproxies:/controller#gamecontroller', 'show_menu', params)
  } else if (actionId == hash('info_gui') && action.released) {
    msg.post('#', 'toggle_info')
  } else if (actionId == hash('pinball') && action.released) {
    msg.post('proxies:/controller#pinballcontroller', 'show_pinball')
  }
}
