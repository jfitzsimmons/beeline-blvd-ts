//import questsData from './quests/data'
//testjpf make new import
//quest
import { subscribe, unsubscribe } from '../dispatcher'

const { quests } = globalThis.game.world

export default {
  quests: {},
  init() {
    for (const [, quest] of Object.entries(questsData)) {
      quests.initQuest(quest)
    }

    ///testjpf
    // now activate new game stuff?
  },
}

//const dispatcher = require "crit.dispatcher"

//const h_toggle = //hash("toggle")

interface props {
  sub_id: number
  //storagename: string
}
export function init(this: props) {
  //this.value = true
  //set_color(this.value)

  this.sub_id = subscribe(['quest_'])
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
    //  if (message == "unlock"){print("unlock")}
    if (message.status == 'unlock') {
      print('unlock: TESTJPF questID:: ', message.questId)
    }
  }
}
