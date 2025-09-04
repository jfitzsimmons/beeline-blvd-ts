import { subscribe, unsubscribe } from '../../../../systems/dispatcher'
const { quests, info, npcs, stations } = globalThis.game.world
const { world_tutorial_medic: wtm } = quests.all

export const world_tutorial_medic = {
  actors: {
    patient: stations.all.grounds_worker1.occupant,
    doctor: '',
  },
  init() {
    //since already here dont use this:
    //quests.updateStatus('activate', 'world_tutorial_medic')
    //but this:
    msg.post('#', hash('quest_tutorial_start'), { status: 'active' })
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
  message: { questId: string; status: string },
  _sender: url
) {
  if (messageId == hash('quest_tutorial_start')) {
    print('TESTJPF!!: This should eventually make a quest available.')
  }
  //  if (message == "unlock"){print("unlock")}
  //todo testjpf make more specific
  if (message.status == 'activate') {
    //testjpf
    //use command object to fire funciton based on msgID
    //that processes below:::ß
    print('unlock: TESTJPF questID:: ', message.questId)
    npcs.all[world_tutorial_medic.actors.patient].love =
      npcs.all[world_tutorial_medic.actors.patient].love + 1
    //this needs to be taken care of by npc??
    //NPC module -> -> subscriptions.ts??
    info.add_interaction(
      `${world_tutorial_medic.actors.patient} likes that you are helping them.`
    )
  }
}
