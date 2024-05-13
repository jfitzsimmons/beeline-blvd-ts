const { world } = globalThis.game
const { rooms } = world

interface props {
  actions: { [key: string]: string[] }
  roomname: string
  storagename: string
}

export function init(this: props): void {
  this.actions = {}
  this.roomname = 'tesjpf'
  this.storagename = ''
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    enter: boolean
    exit: boolean
    storagename: string
    roomname: string
  },
  _sender: url
): void {
  if (messageId == hash('trigger_response') && message.enter) {
    const params = {
      pos: go.get_position('/shared/adam'),
      actions: this.actions,
      room: this.roomname,
    }
    msg.post('/shared/adam#interact', 'shownode', params)
  } else if (messageId == hash('trigger_response') && message.exit) {
    const params = {
      texts: this.actions,
    }
    msg.post('/shared/adam#interact', 'hidenode', params)
  } else if (messageId == hash('load_storage_inventory')) {
    this.storagename = message.storagename
    this.roomname = message.roomname

    this.actions[this.storagename] =
      rooms.all[this.roomname].actors[this.storagename].actions
  }
}
