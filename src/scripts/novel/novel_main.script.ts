import { novel_init, novel_start } from './matchanovel'
const { npcs, tasks, player, novels } = globalThis.game.world

import { prepareQuestTxts } from '../systems/tasks/quests'
import { impressed_checks, unimpressed_checks } from '../systems/chaossystem'

interface props {
  npcname: string
  cause: string
}

function prepare_novel_txts(room = true, extend = false) {
  print(
    'PNT::: frcn',
    novels.forced,
    novels.reason,
    novels.cause,
    novels.npc.name
  )
  //TESTJPF could move some logic to novelcontroller
  const paths: string[] = []
  if (room) paths.unshift(player.currRoom + '/default')
  if (novels.npc.currStation != null) {
    paths.unshift('stations/' + novels.npc.currStation)
    paths.unshift(player.currRoom + '/' + novels.npc.currStation)
  }
  print('NOVELVOVEL4 LAST reaso:', novels.reason)
  const causeOrReason = ['clearance'].includes(novels.cause)
    ? novels.cause
    : novels.reason
  paths.push(`reasons/${causeOrReason}`)
  paths.unshift('clans/' + novels.npc.clan)
  const checkpoint =
    extend == true ? player.checkpoint : player.checkpoint.slice(0, -1)
  paths.unshift(checkpoint + '/default')
  //TESTJPF one of these will/should have "label queststart"????
  //so reason will be quest and questScript will load appropriate txts
  // ex tutorial/getadoctor.txt
  // so stop worrying about reason = "quest"
  //you'll find a reason to use /reasons/quest.txt defaults
  //testjpf this should be a Behavior!!! Todo!!
  if (novels.npcsWithQuest.includes(novels.npc.name)) novels.reason = 'quest'
  const quest_paths: string[] = prepareQuestTxts[player.checkpoint + 'scripts'](
    novels.npc.name
  )
  print(
    'NOVELVOVEL1:: questpaths',
    quest_paths[0],
    novels.npc.name,
    novels.reason
  )
  paths.push(...quest_paths)
  novels.scripts = paths
}

function consolation_outcomes(love: number) {
  //print(novels.npc.love, '| novels.npc.love = love |', love)
  if (love > novels.npc.love) {
    const consequence = impressed_checks('player', novels.npc.name)
    if (consequence != 'neutral') print('todotestjpf')
    //testjpf make a sequence todo
    // tasks.taskBuilder(novels.npc.name, consequence, 'player', 'impressed')

    novels.npc.love = love
    // they try to rob you?
    //they leave the room!!!
    // make npc more ALERT
    // tip about quests
    // tip about environment medics need help, maintenance, security,
    //tip about clan hates you , loves you
    // punches
    //challenge to "fight?"
  } else if (love < novels.npc.love) {
    //could be ELSE

    const consequence = unimpressed_checks('player', novels.npc.name)

    if (consequence != 'neutral')
      tasks.taskBuilder(novels.npc.name, consequence, 'player', 'unimpressed') //todo
  }
}

function novel_outcomes(reason: string) {
  if (reason == 'faint' || player.hp <= 0) {
    msg.post('worldproxies:/controller#worldcontroller', 'pick_room', {
      roomName: tasks.spawn,
      loadType: 'faint',
    })
  } else if (reason == 'arrested') {
    tasks.removeHeat('player')
    msg.post('worldproxies:/controller#worldcontroller', 'pick_room', {
      roomName: 'security',
      loadType: 'arrest',
    })
  } else if (reason.substring(0, 6) == 'quest:') {
    novels.reason = reason.substring(7)
    print('novel outcome reason::', novels.reason)
    novels.append_npc_quest(novels.npc.name)
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
    print('novelpriority', novels.forced)
    prepare_novel_txts()
    print('novelpriority', novels.forced)

    // novels.alertChange = player.alert_level
    novel_init(novels.scripts)
    novel_start()
  } else if (messageId == hash('sleep')) {
    player.hp = message.hp
    novels.npc.sincePlayerConvo = 0
    npcs.all[novels.npc.name].sincePlayerConvo = 0

    novel_outcomes(message.reason)
    if (player.alert_level != message.alert) {
      /**
       * the should creat new SnitchSEq
       * testjpf
       */
      player.alert_level = message.alert
      if (tasks.plan_on_snitching(novels.npc.name, 'player') == false) {
        // tasks.taskBuilder(novels.npc.name, 'snitch', 'player', 'harassing')
      }
      msg.post(player.currRoom + ':/shared/scripts#level', 'update_alert', {})
    } else {
      if (message.love != novels.npc.love) {
        novels.npc.love = message.love

        //testjpf start here
        // you have player.heat now what??
        // how to use that to generate offender? harrassment?
        consolation_outcomes(message.love)
      }
    }

    //
    msg.post('worldproxies:/controller#novelcontroller', 'unload_novel')
    msg.post(player.currRoom + ':/shared/scripts#level', 'exit_gui')
  }
}
