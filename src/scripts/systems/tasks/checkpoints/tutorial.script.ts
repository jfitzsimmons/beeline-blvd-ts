import { subscribe, unsubscribe } from '../../dispatcher'
//import { tutorialA, wtm0injured } from './tutorial/stage1'
const { quests, info, npcs, stations } = globalThis.game.world
const { world_tutorial_medic: wtm } = quests.all

/**
 * TESTJPF
 * this isnt being used at all
 * in reality this would be an upgead/unlock/reward/achievement/completion
 * unlocks can recieve a message
 * but either way they are
 * going to use a method called
 * unlock()?
 * export default {
 * id: 'unlock_quest_default'
 * unlock: wtm0default({message:{patient:''}})
 * init(unlock: Unlock){set everything}
 * }
 */
export const world_tutorial_medic = {
  //stages: [wtm0injured],
  init() {
    //since already here dont use this:
    //quests.updateStatus('activate', 'world_tutorial_medic')
    //but this:
    //msg.post('#', hash('world_tutorial_medic'), { status: 'active' })
    wtm.status.active = true //testjpf should probable be a setter
    //make a random npc injured.
    //subscribe to their quest.
    //ignored by other  npcs
  },
  tick() {
    if (wtm.status.active == true) {
      if (wtm.stages[0].status.active == false) {
        //increases number of turns until fail??
      } else if (wtm.stages[0].status.active == true) {
        // this.stages[0]()
        //increases number of turns until fail?? after a reset???
      }
    }
  },
}

interface props {
  sub_id: number
  //storagename: string
}
export function init(this: props) {
  //this.value = true
  //set_color(this.value)

  this.sub_id = subscribe(['world_tutorial_medic', 'world_tutorial_luggage'])
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
  message: { questId: string; status: string; patient: string },
  _sender: url
) {
  //  if (message == "unlock"){print("unlock")}
  //todo testjpf make more specific
  if (message.status == 'activate') {
    if (messageId == hash('world_tutorial_medic')) {
      //at some point i need to injure a default npc testjpf
      print('TESTJPF!!: This should eventually make a quest available.')
    }
    if (messageId == hash('agreedToHelp') && wtm.unlocks != undefined) {
      wtm.unlocks[0](message.patient)
    }
    if (messageId == hash('world_tutorial_medic_1')) {
      //testjpf subscribe doctors to this task.
      // // add to active quests probably
    }
  }
}
