import { novel_init, novel_start } from './matchanovel'
print('novel main 4th??')
const { npcs, tasks, player, novel } = globalThis.game.world

import { questScripts } from '../quests/quests_main'
import { impressed_checks, unimpressed_checks } from '../systems/tasksystem'

interface props {
  npcname: string
  cause: string
}

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
  //!!!!testjpf set novel reason along with questScript
  //if (paths.length > 0) novel.reason = 'quest'
  paths.unshift('clans/' + novel.npc.clan)

  if (room) {
    paths.unshift(player.currentroom + '/default')
  }
  paths.unshift(checkpoint + '/default')
  if (novel.npc.currentstation != null) {
    paths.unshift('stations/' + novel.npc.currentstation)
    paths.unshift(player.currentroom + '/' + novel.npc.currentstation)
  }
  const caution = tasks.npc_has_caution('any', novel.npc.labelname)

  if (caution != null) {
    print(
      'CAUTION:::',
      caution.reason,
      caution.label,
      caution.npc,
      caution.suspect,
      caution.authority,
      caution.type
    )
    // toso testjpf ahve to nail down these names whendone here with a few quests.
    novel.reason = caution.reason
    novel.quest.label = caution.type
  }
  paths.push('reasons/' + novel.reason)
  //print('NOVEL>REASON:::', novel.reason)
  novel.scripts = paths
}

function consolation_outcomes(love: number) {
  //print(novel.npc.love, '| novel.npc.love = love |', love)
  if (love > novel.npc.love) {
    const consequence = impressed_checks('player', novel.npc.labelname)
    print('impressed consequence:: ', consequence)
    if (consequence != 'neutral')
      tasks.caution_builder(novel.npc, consequence, 'player', 'impressed')

    novel.npc.love = love
    // they try to rob you?
    //they leave the room!!!
    // make npc more ALERT
    // tip about quests
    // tip about environment medics need help, maintenance, security,
    //tip about clan hates you , loves you
    // punches
    //challenge to "fight?"
  } else if (love < novel.npc.love) {
    //could be ELSE

    const consequence = unimpressed_checks('player', novel.npc.labelname)
    print('UNimpressed consequence:: ', consequence)

    if (consequence != 'neutral')
      tasks.caution_builder(novel.npc, consequence, 'player', 'unimpressed')
    // testjpf else cautionbuilder(npc, "offender", player, harassment)
    //cooldown???
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
    novel.reason = reason.substring(7)
  }
  //if love positive. consolation checks. else negatice
  //only merits is positive
  // temp love boost!!
  //temp love drop
  // they try to rob you?
  //they leave the room!!!
  //player ap boost]
  // make npc more ALERT
  //recieve gift!
  //generate_random_gift() food, supplies, money
  // tip about quests
  // tip about environment medics need help, maintenance, security,
  //tip about clan hates you , loves you
  // punches
  //challenge to "fight?"
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
    novel.npc.turns_since_convo = 0

    novel_outcomes(message.reason)
    if (player.alert_level != message.alert) {
      player.alert_level = message.alert
      if (tasks.plan_on_snitching(novel.npc.labelname, 'player') == false) {
        tasks.caution_builder(novel.npc, 'snitch', 'player', 'harassing')
      }
      msg.post(
        player.currentroom + ':/shared/scripts#level',
        'update_alert',
        {}
      )
    } else {
      if (message.love != novel.npc.love) {
        print('novel.npc.love1', novel.npc.love, message.love)
        novel.npc.love = message.love
        print('novel.npc.love1', novel.npc.love, message.love)

        //testjof start here
        // you have player.heat now what??
        // how to use that to generate offender? harrassment?
        consolation_outcomes(message.love)
      }
    }

    npcs.all[novel.npc.labelname] = { ...novel.npc }

    msg.post('proxies:/controller#novelcontroller', 'unload_novel')
    msg.post(player.currentroom + ':/shared/scripts#level', 'exit_gui')
  }
}
