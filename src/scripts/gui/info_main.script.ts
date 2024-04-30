//import { novel_init, novel_start } from './matchanovel'
print('novel main 4th??')
const { player } = globalThis.game.world

//import { questScripts } from '../quests/quests_main'
//import { impressed_checks, unimpressed_checks } from '../systems/tasksystem'

interface props {
  npcname: string
  cause: string
}
/** 
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
    paths.unshift('stations/' + novel.npc.currentstation)
    paths.unshift(player.currentroom + '/' + novel.npc.currentstation)
  }
  const caution = tasks.npc_has_caution(novel.npc.labelname, 'player')

  if (caution != null) novel.reason = caution.reason
  paths.push('reasons/' + novel.reason)
  novel.scripts = paths
}

function consolation_outcomes(love: number) {

  if (love > novel.npc.love) {
    const consequence = impressed_checks('player', novel.npc.labelname)
    print('impressed consequence:: ', consequence)
    if (consequence != 'neutral')
      tasks.caution_builder(novel.npc, consequence, 'player', 'impressed')

    novel.npc.love = love
  
  } else if (love < novel.npc.love) {

    const consequence = unimpressed_checks('player', novel.npc.labelname)
    print('UNimpressed consequence:: ', consequence)

    if (consequence != 'neutral')
      tasks.caution_builder(novel.npc, consequence, 'player', 'unimpressed')

  }
}

function novel_outcomes(reason: string) {
  print('novel outcome :: reason:', reason)
  //testjpf create func() called+. emergencies()????
  if (reason == 'faint') {
    const params = {
      enter_room: tasks.spawn,
    }
    msg.post('proxies:/controller#worldcontroller', 'faint', params)
  } else if (reason == 'arrested') {
    tasks.remove_heat('player')
    msg.post('proxies:/controller#worldcontroller', 'arrested', {
      enter_room: 'security',
    })
  } else if (reason.substring(0, 6) == 'quest:') {
    //testjpf remove spaces??
    novel.quest.solution = reason.substring(7)
  }

}
*/
export function on_message(
  this: props,
  messageId: hash,
  //message: {},
  _sender: url
): void {
  if (messageId == hash('wake_up')) {
    print('INFO LOADED AND WOKEN UP')
  } else if (messageId == hash('sleep')) {
    msg.post('proxies:/controller#infocontroller', 'unload_info')
    msg.post(player.currentroom + ':/shared/scripts#level', 'exit_gui')
  }
}
