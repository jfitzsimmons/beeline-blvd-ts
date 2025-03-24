const { world } = globalThis.game
const { rooms } = world

interface props {
  actions: { [key: string]: string[] }
  roomName: string
  storagename: string
}

export function init(this: props): void {
  this.actions = {}
  this.roomName = ''
  this.storagename = ''
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    enter: boolean
    exit: boolean
    storagename: string
    roomName: string
  },
  _sender: url
): void {
  if (messageId == hash('trigger_response')) {
    if (message.enter) {
      const params = {
        pos: go.get_position('/shared/adam'),
        actions: this.actions,
        npcname: this.storagename,
      }
      msg.post('/shared/adam#interact', 'shownode', params)
    } else {
      msg.post('/shared/adam#interact', 'hidenode')
    }
  } else if (messageId == hash('load_storage_inventory')) {
    this.storagename = message.storagename
    this.roomName = message.roomName

    this.actions[this.storagename] =
      rooms.all[this.roomName].actors[this.storagename].actions
  }
}
