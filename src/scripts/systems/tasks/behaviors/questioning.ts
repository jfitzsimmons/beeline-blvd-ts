import { Quest } from '../../../../types/tasks'
import { subscribe, unsubscribe } from '../../dispatcher'
const { quests, info, npcs, stations } = globalThis.game.world
//const { world_tutorial_medic: wtm } = quests.all

export default {
  actors: {
    patient: stations.all.grounds_worker1.occupant,
    doctor: '',
  },
  init() {
    //since already here dont use this:
    //quests.updateStatus('activate', 'world_tutorial_medic')
    //but this:
    // msg.post('#', hash('world_tutorial_medic'), { status: 'active' })
    //  wtm.status.active = true //testjpf should probable be a setter
    //make a random npc injured.
    //subscribe to their quest.
    //ignored by other  npcs
  },
  tick(quest: Quest) {
    //loop through other npcs and see if they passed by
    // add questionAction logic here
  },
}

interface props {
  sub_id: number
  //storagename: string
}
export function init(this: props) {
  //this.value = true
  //set_color(this.value)

  this.sub_id = subscribe(['npc_questioning_'])
  ///testjpf
  //could do instead, subscribe['quest_']
  //and get all quest messages. then in Tuturial
  //I could get all quest_tutorial_
  //and unsubscribe when tuts is over
}

export function final(this: props) {
  unsubscribe(this.sub_id)
}
//testjpf
//could import from a sub folder
//something like questHashTable
export function on_message(
  this: props,
  messageId: hash,
  message: { questId: string; status: string },
  _sender: url
) {
  //  if (message == "unlock"){print("unlock")}
  //todo testjpf make more specific
  if (message.status == 'backup') {
    //warn other officers
  }
}
