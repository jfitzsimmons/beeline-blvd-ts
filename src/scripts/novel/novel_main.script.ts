/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
print('novel main 4th??')
const { tasks, player, novel } = globalThis.game.world

const matchanovel = require('../../../main/novel/matchanovel.lua')

import { questScripts } from '../quests/quests_main'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function script_builder(
  //npc: string,
  room: boolean | true = true,
  //station: string,
  //caution: string,
  extend: boolean | false = false
  //checkpoint: string | 'tutorialA'
) {
  let checkpoint = player.checkpoint.slice(0, -1)
  if (extend == true) {
    checkpoint = player.checkpoint
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let path: string =
    novel.script != ''
      ? questScripts[checkpoint + 'scripts'](novel.npc.labelname)
      : ''

  if (path == '') {
    if (room) {
      path = path + player.currentroom + '/'
    }
    path = path + checkpoint
    if (novel.npc.currentstation != null) {
      print(
        'novel noc:',
        novel.npc.labelname,
        ' | station:',
        novel.npc.currentstation
      )
      path = path + novel.npc.currentstation
    }
    const caution = tasks.npc_has_caution(novel.npc.labelname, 'player')
    if (caution != null) {
      path = path + caution
    }
  }
  print('PATH:::', path)
  novel.script = '/main/novel/assets/scripts/' + path + '.txt'
  print('novel.script testjpf', novel.script)
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
    script_builder()
    novel.alertChange = player.alert_level
    print('global novel npc', globalThis.game.world.novel.npc.labelname)
    print('global any npc', globalThis.game.world.npcs.all.eve.labelname)

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
        enter_room: tasks.spawn,
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
        tasks.caution_builder(novel.npc, 'snitch', 'player', 'harassing')
      }
      msg.post(player.currentroom + ':/level#level', 'update_alert', {})
    }
    //print('NOVEL::: message.alert', message.alert)
    print('NOVEL::: player.alert_level', player.alert_level)
    msg.post(player.currentroom + ':/level#level', 'exit_gui', { novel: true })
  }
}
