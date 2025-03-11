import { novel_init, novel_start } from './matchanovel'
const { npcs, tasks, player, novel } = globalThis.game.world

import { prepareQuestTxts } from '../quests/quests_main'
import { impressed_checks, unimpressed_checks } from '../systems/chaossystem'

interface props {
  npcname: string
  cause: string
}

function prepare_novel_txts(
  room: boolean | true = true,
  extend: boolean | false = false
) {
  print('PNT::: frcn', novel.forced, novel.reason, novel.cause, novel.npc.name)
  //TESTJPF could move some logic to novelcontroller
  const paths: string[] = []

  const quest_paths: string[] = prepareQuestTxts[player.checkpoint + 'scripts'](
    novel.npc.name
  )
  print(
    'NOVELVOVEL1:: questpaths',
    quest_paths[0],
    novel.npc.name,
    novel.reason
  )

  let checkpoint = player.checkpoint.slice(0, -1)

  if (extend == true) {
    checkpoint = player.checkpoint
  }
  //const task = tasks.npcHasTask([novel.npc.name], ['player'])
  //if (task != null) {
  // print('NOVELVOVEL2 task1:', task.label)
  //could use this at level addresstasks testjpf
  // novel.task = { ...task }
  //used for ai witnessing player and failing confrontation check
  //questioning without accusation
  // if (!['concern'].includes(novel.reason)) novel.reason = task.cause
  // print('NOVELVOVEL2 task2: novel.reason:', novel.reason)
  /**TESTJPF
   * this is checking if npcs has arrest or task.
   * Player is checked on level
   * I believe this will overwrite player if NPX also has one of these tasks
   * could test with test npc on grounds
   * FIX:::
   * this checks if already set
   * naming could be better
   */
  //}
  print('posttaskchk', novel.reason)
  // if (
  //  !['questioning', 'arrest'].includes(novel.reason) &&
  //  ['questioning', 'arrest'].includes(novel.cause)
  // ) {
  //  novel.reason = novel.task.cause
  // }
  print('NOVELVOVEL2 task3: novel.reason:', novel.reason)

  if (novel.npcsWithQuest.includes(novel.npc.name)) novel.reason = 'quest'
  print('NOVELVOVEL3 quest??: novel.reason:', novel.reason)

  if (room) paths.unshift(player.currRoom + '/default')
  if (novel.npc.currStation != null) {
    paths.unshift('stations/' + novel.npc.currStation)
    paths.unshift(player.currRoom + '/' + novel.npc.currStation)
  }
  print('NOVELVOVEL4 LAST reaso:', novel.reason)
  const causeOrReason = ['clearance'].includes(novel.cause)
    ? novel.cause
    : novel.reason
  paths.push(`reasons/${causeOrReason}`)
  paths.unshift('clans/' + novel.npc.clan)
  paths.unshift(checkpoint + '/default')

  //TESTJPF one of these will/should have "label queststart"????
  //so reason will be quest and questScript will load appropriate txts
  // ex tutorial/getadoctor.txt
  // so stop worrying about reason = "quest"
  //you'll find a reason to use /reasons/quest.txt defaults
  paths.push(...quest_paths)

  novel.scripts = paths
}

function consolation_outcomes(love: number) {
  //print(novel.npc.love, '| novel.npc.love = love |', love)
  if (love > novel.npc.love) {
    const consequence = impressed_checks('player', novel.npc.name)
    if (consequence != 'neutral')
      tasks.taskBuilder(novel.npc.name, consequence, 'player', 'impressed')

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

    const consequence = unimpressed_checks('player', novel.npc.name)

    if (consequence != 'neutral')
      tasks.taskBuilder(novel.npc.name, consequence, 'player', 'unimpressed')
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
    novel.reason = reason.substring(7)
    print('novel outcome reason::', novel.reason)
    novel.append_npc_quest(novel.npc.name)
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
    print('novelpriority', novel.forced)
    prepare_novel_txts()
    print('novelpriority', novel.forced)

    // novel.alertChange = player.alert_level
    novel_init(novel.scripts)
    novel_start()
  } else if (messageId == hash('sleep')) {
    player.hp = message.hp
    novel.npc.sincePlayerConvo = 0
    npcs.all[novel.npc.name].sincePlayerConvo = 0

    novel_outcomes(message.reason)
    if (player.alert_level != message.alert) {
      /**
       * the should creat new SnitchSEq
       * testjpf
       */
      player.alert_level = message.alert
      if (tasks.plan_on_snitching(novel.npc.name, 'player') == false) {
        // tasks.taskBuilder(novel.npc.name, 'snitch', 'player', 'harassing')
      }
      msg.post(player.currRoom + ':/shared/scripts#level', 'update_alert', {})
    } else {
      if (message.love != novel.npc.love) {
        novel.npc.love = message.love

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
