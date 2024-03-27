import { novel_init, novel_start } from './matchanovel'
print('novel main 4th??')
const { tasks, player, novel } = globalThis.game.world

import { questScripts } from '../quests/quests_main'

function script_builder(
  room: boolean | true = true,
  extend: boolean | false = false
) {
  let checkpoint = player.checkpoint.slice(0, -1)
  if (extend == true) {
    checkpoint = player.checkpoint
  }
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
  novel.script = '/assets/novel/scripts/' + path + '.txt'
}
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
    novel_init(novel.script)
    novel_start()
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
