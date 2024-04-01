import { novel_init, novel_start } from './matchanovel'
print('novel main 4th??')
const { npcs, tasks, player, novel } = globalThis.game.world

import { questScripts } from '../quests/quests_main'

function script_builder(
  room: boolean | true = true,
  extend: boolean | false = false
) {
  let checkpoint = player.checkpoint.slice(0, -1)
  if (extend == true) {
    checkpoint = player.checkpoint
  }
  const paths: string[] = questScripts[player.checkpoint + 'scripts'](
    novel.npc.labelname
  )
  if (paths.length > 0) novel.reason = 'quest'
  paths.unshift('clans/' + novel.npc.clan)

  if (room) {
    paths.unshift(player.currentroom + '/default')
  }
  paths.unshift(checkpoint + '/default')
  if (novel.npc.currentstation != null) {
    print(
      'novel noc:',
      novel.npc.labelname,
      ' | station:',
      novel.npc.currentstation
    )

    paths.unshift('stations/' + novel.npc.currentstation)
    paths.unshift(player.currentroom + '/' + novel.npc.currentstation)
  }
  const caution = tasks.npc_has_caution(novel.npc.labelname, 'player')

  if (caution != null) novel.reason = caution.reason
  paths.push('reasons/' + novel.reason)
  print('NOVEL>REASON:::', novel.reason)
  novel.scripts = paths
}

interface props {
  npcname: string
  cause: string
}
export function on_message(
  this: props,
  messageId: hash,
  message: {
    npcname: string
    love: number
    alert: number
    hp: number
    reason: string
  },
  _sender: url
): void {
  if (messageId == hash('wake_up')) {
    script_builder()
    // novel.alertChange = player.alert_level
    novel_init(novel.scripts)
    novel_start()
  } else if (messageId == hash('sleep')) {
    player.hp = message.hp
    novel.npc.turns_since_encounter = 0

    if (message.love != novel.npc.love) {
      print(novel.npc.love, '| novel.npc.love = message.love |', message.love)
      novel.npc.love = message.love
    }
    npcs.all[novel.npc.labelname] = { ...novel.npc }

    msg.post('proxies:/controller#novelcontroller', 'unload_novel')

    //testjpf create func() called+. emergencies()????
    if (message.reason == 'faint') {
      const params = {
        enter_room: tasks.spawn,
      }
      msg.post('proxies:/controller#worldcontroller', 'faint', params)
    } else if (message.reason == 'arrested') {
      tasks.remove_heat('player')
      msg.post('proxies:/controller#worldcontroller', 'arrested', {
        enter_room: 'security',
      })
    }
    if (message.reason.substring(0, 6) == 'quest:') {
      //testjpf remove spaces??
      novel.quest.solution = message.reason.substring(7)
    }
    if (player.alert_level != message.alert) {
      player.alert_level = novel.alertChange
      if (tasks.plan_on_snitching(novel.npc.labelname, 'player') == false) {
        tasks.caution_builder(novel.npc, 'snitch', 'player', 'harassing')
      }
      msg.post(player.currentroom + ':/level#level', 'update_alert', {})
    }
    //TESTJPF If you need to reload scripts, do it here, not level or interact.
    novel.reason = 'none'
    msg.post(player.currentroom + ':/level#level', 'exit_gui')
  }
}
