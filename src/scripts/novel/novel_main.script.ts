import { novel_init, novel_start } from './matchanovel'
const { npcs, tasks, player, novel } = globalThis.game.world

import { prepareQuestTxts } from '../quests/quests_main'
import { impressed_checks, unimpressed_checks } from '../systems/tasksystem'

interface props {
  npcname: string
  cause: string
}

function prepare_novel_txts(
  room: boolean | true = true,
  extend: boolean | false = false
) {
  //TESTJPF could move some logic to novelcontroller
  const paths: string[] = []
  const caution = tasks.npc_has_caution('any', novel.npc.labelname)
  const quest_paths: string[] = prepareQuestTxts[player.checkpoint + 'scripts'](
    novel.npc.labelname
  )
  let checkpoint = player.checkpoint.slice(0, -1)

  if (extend == true) {
    checkpoint = player.checkpoint
  }
  if (caution != null) {
    novel.caution = { ...caution }
    //used for ai witnessing player and failing confrontation check
    //questioning without accusation
    if (!['concern'].includes(novel.reason)) novel.reason = caution.reason
    /**TESTJPF
     * this is checking if npcs has arrest or caution.
     * Player is checked on level
     * I believe this will overwrite player if NPX also has one of these cautions
     * could test with test npc on grounds
     * FIX:::
     * this checks if already set
     * naming could be better
     */
    if (
      !['questioning', 'arrest'].includes(novel.reason) &&
      ['questioning', 'arrest'].includes(novel.caution.label)
    )
      novel.reason = novel.caution.reason
  }
  if (novel.npcsWithQuest.includes(novel.npc.labelname)) novel.reason = 'quest'

  if (room) paths.unshift(player.currentroom + '/default')
  if (novel.npc.currentstation != null) {
    paths.unshift('stations/' + novel.npc.currentstation)
    paths.unshift(player.currentroom + '/' + novel.npc.currentstation)
  }
  paths.push(`reasons/${novel.reason}`)
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
    const consequence = impressed_checks('player', novel.npc.labelname)
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

    if (consequence != 'neutral')
      tasks.caution_builder(novel.npc, consequence, 'player', 'unimpressed')
  }
}

function novel_outcomes(reason: string) {
  if (reason == 'faint' || player.hp <= 0) {
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
    novel.reason = reason.substring(7)
    print('novel outcome reason::', novel.reason)
    novel.append_npc_quest(novel.npc.labelname)
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
    prepare_novel_txts()
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
        novel.npc.love = message.love

        //testjpf start here
        // you have player.heat now what??
        // how to use that to generate offender? harrassment?
        consolation_outcomes(message.love)
      }
    }

    npcs.all[novel.npc.labelname] = novel.npc

    msg.post('proxies:/controller#novelcontroller', 'unload_novel')
    msg.post(player.currentroom + ':/shared/scripts#level', 'exit_gui')
  }
}
