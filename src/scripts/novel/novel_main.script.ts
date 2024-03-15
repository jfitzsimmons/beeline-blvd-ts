/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const quest = require('../../../main.systems.quests.quest_main')
const matchanovel = require('../../../main.novel.matchanovel')
//const save = require ("main.novel.save")
//const settings = require ("main.novel.settings")
//might need a globalThis.game.novel??? TESTJPF
//make it a class constructed by World?
//leaning towards class.
//import { Npcs, PlayerState, Skills, QuestMethods } from '../../types/state'
const { tasks, npcs, player, novel } = globalThis.game.world

function script_builder(
  //npc: string,
  room: boolean | false = false,
  //station: string,
  //caution: string,
  extend: boolean | false = false
  //checkpoint: string | 'tutorialA'
) {
  const name = novel.npc.labelname
  let checkpoint = player.checkpoint.slice(0, -1)
  if (extend == true) {
    checkpoint = player.checkpoint
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let path: string =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    quest.checkpoints[checkpoint].scripts[checkpoint + 'scripts'](name)

  if (path == '') {
    if (room) {
      path = path + player.currentroom + '/'
    }
    path = path + checkpoint
    if (npcs.all[name].currentstation != null) {
      path = path + npcs.all[name].currentstation
    }
    const caution = tasks.npc_has_caution(name, 'player')
    if (caution != null) {
      path = path + caution
    }
  }
  print('PATH:::', path)
  return path
}
//u = require "main.utils.novel"
// need to check out the message coming to this file
//probs from worldcontroller? novelcontroller
interface props {
  npcname: string
  cause: string
}
export function on_message(
  this: props,
  messageId: hash,
  message: { npcname: string; cause: string },
  _sender: url
): void {
  if (messageId == hash('wake_up')) {
    //this.npcname = message.npcname
    novel.npc = npcs.all[message.npcname]
    /** 
		//set globalThis...novel.npc, '''novel.reason, '''novel.set_sprites()
		//or just one novel.set_novel()
		this.npc = message.npc
		this.roomname = message.roomname
		//testjpf i wonder if this is handled better in original matchanovel
		// cant use this in html.  no file load. indexDB only.
		//TESTJPF i think path / novel string should be a part of Npc class
			//maybe with a backup of Novel class script!!??
		const pathstring = "/main/novel/assets/scripts/" + message.path + ".txt"
		
		if (message.reason != null) { reason = message.reason }
		//testjpf probably a better way to do this TODO
		
		npc = npcs.all[this.npc] 
		npc.sighsprite = "/main/novel/assets/characters/" + this.npc + "/sigh.png"
		npc.madsprite = "/main/novel/assets/characters/" + this.npc + "/angry.png"
		npc.frownsprite = "/main/novel/assets/characters/" + this.npc + "/frown.png"
		npc.laughsprite = "/main/novel/assets/characters/" + this.npc + "/laugh.png"
		npc.smilesprite = "/main/novel/assets/characters/" + this.npc + "/smile.png"
		
		//player = player
		// I think this all i'll need for a while.  Delete all else
		//matchanovel.init(pathstring)**/
    //I could see some logic here maybe that determines which script to use
    //npc, novel defaults, other...
    novel.script = script_builder()
    novel.alertChange = player.alert_level
    matchanovel.init(novel.script)
    matchanovel.start()
  } else if (messageId == hash('sleep')) {
    /**
    if (message.merits != null) {
      npcs.all[this.npc].love = message.merits
      npcs.all[this.npc].turns_since_encounter = 0
    }
    print('player.hp', player.hp)
    print(
      'npcs.all[this.npc].turns_since_encounter',
      npcs.all[this.npc].turns_since_encounter
    )**/
    msg.post('proxies:/controller#novelcontroller', 'unload_novel')

    //testjpf create func() called+. emergencies()????
    if (message.cause == 'faint') {
      const params = {
        enter_room: quest.checkpoints[player.checkpoint.slice(0, -1)].spawn,
      }
      msg.post('proxies:/controller#worldcontroller', 'faint', params)
    } else if (message.cause == 'arrested') {
      //testjpf mught be a better function for
      //Novel class
      //probably all these 'sleep' conditions could be class based
      tasks.remove_heat('player')
      msg.post('proxies:/controller#worldcontroller', 'arrested', {
        enter_room: 'security',
      })
    }
    print('NOVEL::: player.alert_level', player.alert_level)
    if (player.alert_level != novel.alertChange) {
      player.alert_level = novel.alertChange
      if (tasks.plan_on_snitching(novel.npc.labelname, 'player') == false) {
        tasks.caution_builder(
          npcs.all[novel.npc.labelname],
          'snitch',
          'player',
          'harassing'
        )
      }
      msg.post(player.currentroom + ':/level#level', 'update_alert', {})
    }
    //print('NOVEL::: message.alert', message.alert)
    print('NOVEL::: player.alert_level', player.alert_level)
    msg.post(player.currentroom + ':/level#level', 'exit_gui', { novel: true })
  }
}
