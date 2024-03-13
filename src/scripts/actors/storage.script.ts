const { world } = globalThis.game
const { rooms } = world

print('world.clock', world.clock)
//const utils: any = require("main.utils.utils");
interface props {
  actions: { [key: string]: string[] }
  roomname: string
  storagename: string
}

export function init(this: props): void {
  //this.chests = {}
  this.actions = {}
  this.roomname = 'tesjpf'
  this.storagename = ''
}
/** 
function prep_storage(this: props, message: { enter: boolean; exit: boolean }) {
	this.storagename = message.storagename;
	this.roomname = message.roomname;
	//this.url = world.rooms.all[this.room].actors[this.storagename].url
    // DEFINITLEY need a WORLD TYPE!! all state types
    //testjpf here now!!!
	this.actions[this.storagename] = world.rooms.all[this.roomname].actors[this.storagename].actions;
}
**/
/**
 * testjpf
 * need to reign in messages.  makes them minimal. find standard and make a type out of.  message may need to be created on the fly by design though. keep in mind.
 */
export function testjpf(_this: props) {
  print('is this nil| this.roomnam', _this.roomname)
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
    testjpf(this)
    const params = {
      pos: go.get_position('adam'),
      actions: this.actions,
      //sender = go.get_id(),
      //  collision = "enter",
      //parenturl = self.url,
      //actorname = self.storagename, just needed for load_sto_inv below
      room: this.roomname,
      //character = false,
    }
    msg.post('/adam#interact', 'shownode', params)
  } else if (messageId == hash('trigger_response') && message.exit) {
    const params = {
      texts: this.actions,
    }
    msg.post('/adam#interact', 'hidenode', params)
  } else if (messageId == hash('load_storage_inventory')) {
    this.storagename = message.storagename
    this.roomname = message.roomname

    this.actions[this.storagename] =
      rooms.all[this.roomname].actors[this.storagename].actions
    //prep_storage(this, message);
    //sprite.play_flipbook("#sprite", message.ani)
  }
}
