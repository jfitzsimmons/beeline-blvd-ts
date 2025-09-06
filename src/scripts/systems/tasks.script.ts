import questsData from './initData/tasks/questData'
import questioningSys from './behaviors/questioning.script'
//testjpf make new import
//quest
import { subscribe, unsubscribe } from './dispatcher'
import { questTasks } from './tasks/quests'
//import { npcTasks } from './npcs/crimeChecks'
import questioning from './behaviors/questioning.script'

const { quests, behaviors, unlocks } = globalThis.game.world

export default {
  quests: {},
  // TESTJPF !!! NOW unlocks / upgrades: ???
  dispatches: {},
  behaviors: { questioning },
  tick() {
    for (const [, quest] of Object.entries(quests.all)) {
      //testjpf need to formalize a questlistener
      if (questTasks[quest.id] !== null) questTasks.tick()
      // if (quest.id.split('_')[1] == 'questioning') questioningSys.tick()
      //TESTJPF then tutorialA, tutb will ahve things like
      // .active(),.see(), that will be called in tick
      // quests.loadCstenss(k)
    }
  },
  init() {
    for (const [, quest] of Object.entries(questsData)) {
      quests.initQuest(quest)
      for (const unlock of quest.unlocks) unlocks.initUnlock(unlock)
      //questTasks[quest.id]()
      // quests.loadListeners(k)
    }
    let bk: keyof typeof this.behaviors
    for (bk in this.behaviors) {
      const behavior = this.behaviors[bk]
      //behaviors.initBehavior(behavior)
      behaviors.addCommand(behavior)
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
  if (message.status == 'add') {
    print('unlock: TESTJPF questID:: ', message.questId)
    // quests.initQuest(quest)
  }
}
