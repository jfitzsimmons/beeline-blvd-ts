import questsData from './initData/tasks/questData'
//testjpf make new import
//quest
import { subscribe, unsubscribe } from './dispatcher'
import { questChecks } from './tasks/quests'

const { quests } = globalThis.game.world

export default {
  quests: {},
  // TESTJPF !!! NOW unlocks / upgrades: ???
  dispatches: {},
  tick() {
    for (const [, quest] of Object.entries(quests.all)) {
      //testjpf need to formalize a questlistener
      if (questChecks[quest.id] !== null) questChecks.tick()
      //TESTJPF then tutorialA, tutb will ahve things like
      // .active(),.see(), that will be called in tick
      // quests.loadCstenss(k)
    }
  },
  init() {
    for (const [, quest] of Object.entries(questsData)) {
      quests.initQuest(quest)
      questChecks[quest.id]()
      // quests.loadListeners(k)
    }
    ///testjpf
    // now activate new game stuff?
  },
  newGame() {
    //testjpf
    // load tutorial listeners
    //make active
    //when active send message with msgid of questid  and message of active
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
  /**
   * !!! TESTJPF
   * loop trhough all the script.ts files and int them too!
   */
  this.sub_id = subscribe(['quest_'])
  ///testjpf
  //could do instead, subscribe['quest_']
  //and get all quest messages. then in Tuturial
  //I could get all quest_tutorial_
  //and unsubscribe when tuts is over
}

export function final(this: props) {
  unsubscribe(this.sub_id)
  //loop through all sun script.ts and run final! todo
  //testjpf
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
  /**
   * testjpf
   * maybe here we just accept status and id
   * just send the message through to sub script??? probably
   */

  if (messageId == hash('quest_tutorial_start')) {
    print('TESTJPF!!: This should eventually make a quest available.')
    //  if (message == "unlock"){print("unlock")}
    if (message.status == 'unlock') {
      print('unlock: TESTJPF questID:: ', message.questId)
    }
  }
}
