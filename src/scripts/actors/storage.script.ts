/* eslint-disable @typescript-eslint/no-unsafe-assignment */

interface room {
    matrix: { x: number, y: number,},
	roomname: string,
	props: string[],
	stations: station[]
	actors: actors
}
interface actor {
    inventory: hash[],
    actions: string[]
    watcher: string,
}
interface world {
    rooms: {
        all: rooms
    },
    player: any
    npcs:any,
    tasks:any,
    clock: number
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const world: world = require("../../main.states.worldstate");
//const utils: any = require("main.utils.utils");
interface station {
    [key: string]: string,
}
interface actors {
    [key: string]: actor,
}
interface rooms {
    [key: string]: room,
}
interface actions {
    [key: string]: string[],
}
// iwant to create
// i bet its weird becasue of npc loader having pockets 
//testjpf
//Drawer {open, steal}

interface props {
    //chests: ???,
    actions: actions,
    roomname: string,
    storagename: string
    //nlife: number
}
/** 
interface collision extends props {
    enter: boolean;
    exit: boolean;
  }
  **/
export function init(this: props): void {
	//this.chests = {}
	this.actions = {};
    this.roomname = "";
    this.storagename = "";
}
/** 
function prep_storage(this: props, message: { enter: boolean; exit: boolean }) {
	this.storagename = message.storagename;
	this.roomname = message.roomname;
	//this.url = world.rooms.all[this.room].actors[this.storagename].url
    // DEFINITLEY need a WORLD TYPE!! all state types
    //testjpf here now!!!
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	this.actions[this.storagename] = world.rooms.all[this.roomname].actors[this.storagename].actions;
}
**/
/**
 * testjpf
 * need to reign in messages.  makes them minimal. find standard and make a type out of.  message may need to be created on the fly by design though. keep in mind.
 */
export function on_message(this: props, messageId: hash, message: {enter: boolean, exit: boolean, storagename: string, roomname: string}, _sender: url): void {
	if (messageId == hash("trigger_response") && message.enter) {
        //non abstracted type ex:
        //interface shownode or interact or showinteract?
        //not interact. enteract gets many messages, interact, 
        //shownode, hidenode
        //testjpf	
        //shownode for npx loader includes script param
        //I THINK i can do this on interaction instead of level load
        //

        const params = {
            pos: go.get_position("adam"),
            actions: this.actions,
           //sender = go.get_id(),
          //  collision = "enter",
            //parenturl = self.url,
            //actorname = self.storagename, just needed for load_sto_inv below
            room: this.roomname
            //character = false,
        };
        msg.post("/adam#interact", "shownode", params );
    } else if (messageId == hash("trigger_response") && message.exit){
        const params = {
            texts: this.actions
        };
        msg.post("/adam#interact", "hidenode", params);
    }
	else if (messageId == hash("load_storage_inventory")) { 
        
        print("load inv:");

        print("load inv",message.roomname);


        this.storagename = message.storagename;
        this.roomname = message.roomname;
        //this.url = world.rooms.all[this.room].actors[this.storagename].url
        // DEFINITLEY need a WORLD TYPE!! all state types
        //testjpf here now!!!
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        print("load inv1",this.storagename);

        this.actions[this.storagename] = world.rooms.all[this.roomname].actors[this.storagename].actions;
        print("load inv2",this.storagename);
        //prep_storage(this, message);
		//sprite.play_flipbook("#sprite", message.ani)
    
    }
}
        