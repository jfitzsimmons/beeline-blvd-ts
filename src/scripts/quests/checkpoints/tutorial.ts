import { Npc } from '../../../types/state'
import { steal_check, take_or_stash } from '../../ai/ai_checks'
import { npc_action_move } from '../../ai/ai_main'
import { from_same_room } from '../../utils/quest'
import { shuffle, surrounding_room_matrix } from '../../utils/utils'

const { rooms, npcs, tasks, player, novel, info } = globalThis.game.world

function medic_assist_checks() {
  const injured = npcs.all[rooms.all.grounds.stations.worker1]
  const doctor = npcs.all[novel.npc.labelname]
  const quest = tasks.quests.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {0:injury,1:doc, 2:apple} = cons
  const { 0: injury, 2: apple, 3: meds } = cons
  if (quest.passed == false) {
    //overly cautious? TESTJPF make sure injured doesnt get into other trouble???
    tasks.remove_heat(injured.labelname)
  }

  if (injury.status == 'inactive' && injury.passed == true) {
    injury.status = 'active'
    quest.status = 'active'
    injured.love = injured.love + 1
    info.add_interaction(
      `${injured.labelname} likes that you are helping them.`
    )
  } else if (
    //TESTJPF !!! Here is where you would have the other options
    // not just apple, but bribe, drugs...
    novel.reason == 'hungrydoc' &&
    injury.status == 'active' &&
    apple.status == 'inactive'
  ) {
    apple.status = 'active'
    //testjpf
    // i think jsut sets novel.reason in script builder.
    //So for 100  turns, this npc will always talk to you about a quest
    //which quest? the one that comes from quest directory scripts
    // as seen in sbuilder:: const quest_paths
    //testjpf need to debug txt scripts related to this quest
    tasks.append_caution({
      label: 'quest',
      time: 100,
      type: 'hungry',
      reason: 'quest',
      npc: doctor.labelname,
      suspect: doctor.labelname,
      authority: 'player',
    })
    info.add_interaction(`${doctor.labelname} needs drugs, money or food.`)
    //info.build_objectives(tasks.quests)
    //testjpf
    // need something to check if this doc was given food.
    // in 'interact' gui send message to exit gui??
    // containing item, maybe who from "npc" or "player"
  } else if (
    apple.status == 'active' &&
    novel.item == 'apple01' &&
    apple.passed == false
  ) {
    //check if last item clicked was apple? testjpf
    //TESTJPF Pass condition is changed HERE not in state
    apple.passed = true
    apple.status = 'complete'

    tasks.remove_quest_cautions(doctor.labelname)
    novel.remove_npc_quest(doctor.labelname)
    novel.reason = 'getadoctor'
    info.add_interaction(`${doctor.labelname} likes that you fed them.`)
    doctor.love = doctor.love + 1

    // testjpf this is overwriting my scriptsdialog functions
    novel.npc = { ...doctor }
    novel.priority = true
    tasks.append_caution({
      label: 'mending',
      time: 100,
      type: 'quest',
      reason: 'field',
      npc: doctor.labelname,
      suspect: injured.labelname,
      authority: 'doctors',
    })
    info.add_interaction(`${injured.labelname} likes that you got a doctor.`)
    injured.love = injured.love + 1
    msg.post('proxies:/controller#novelcontroller', 'show_scene')

    //testjpf open dialog with thanks and next task???
    // use novel_init here jsut to laod the same tutorial/
    //testjpf
    // need something to check if this doc was given food.
    // in 'interact' gui send message to exit gui??
    // containing item, maybe who from "npc" or "player"
  } else if (novel.reason == 'getsomemeds' && meds.status == 'inactive') {
    meds.status = 'active'
    player.add_inventory('note')
    print(
      'TRY TO MOVE:',
      doctor.labelname,
      'from:',
      doctor.currentstation,
      'to worker1'
    )

    tasks.append_caution({
      label: 'clearance',
      time: 8,
      type: 'type3',
      reason: 'medical',
      npc: doctor.labelname,
      suspect: 'player',
      authority: 'security',
    })
    info.add_interaction(`${doctor.labelname}'s gave you clearance for 8 turns`)

    //TESTJPF ACTIVEATE SIDE QUEST HERE
    //not in else ifs
    quest.side_quests![1].status = 'active'
    player.clearance = 3

    msg.post(`/${doctor.currentstation}#npc_loader`, hash('move_npc'), {
      station: 'worker1',
      npc: doctor.labelname,
    })

    // create caution for... 10 turns?
    // i don't have cleareance logic setup!!
    //testjpf add "note" to inventory
  } else if (novel.reason == 'rejectmeds') {
    info.add_interaction(`${doctor.labelname} doesn't like you wont help.`)
    injured.love = injured.love - 1
    print(
      'TRY TO MOVE:',
      doctor.labelname,
      'from:',
      doctor.currentstation,
      'to worker1'
    )
    msg.post(`/${doctor.currentstation}#npc_loader`, hash('move_npc'), {
      station: 'worker1',
      npc: doctor.labelname,
    })
    // create caution for... 10 turns?
    // i don't have cleareance logic setup!!
    //testjpf add "note" to inventory
  } else if (
    quest.side_quests![1].status == 'active' &&
    meds.status == 'active' &&
    player.clearance - 3 < rooms.all[player.currentroom].clearance &&
    from_same_room(npcs.return_security(), player.currentroom) != null
  ) {
    novel.caution.label = 'questioning'
    novel.caution.reason = 'tutsclearance'
    novel.priority = true
    novel.npc = from_same_room(npcs.return_security(), player.currentroom)!
    quest.side_quests![1].passed = true
    quest.side_quests![1].status = 'complete'

    msg.post('proxies:/controller#novelcontroller', 'show_scene')
  }
  //TESTJPF ELSE if quest complete dialog, xp / money???
}

export function tutorialA(interval = 'turn') {
  const quest = tasks.quests.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {0:injury,1:doc,2: apple, 3: meds} = cons
  const { 0: injury, 2: apple } = cons
  const luggage =
    math.random() > 0.5
      ? rooms.all.grounds.actors.player_luggage
      : rooms.all.grounds.actors.other_luggage
  if (luggage.inventory.length > 0 && interval == 'turn') {
    const worker2 = npcs.all[rooms.all['grounds'].stations.worker2]
    const guest2 = npcs.all[rooms.all['grounds'].stations.guest2]

    if (worker2 != null && worker2.cooldown <= 0) {
      guest2 == null
        ? take_or_stash(worker2, rooms.all.grounds.actors.player_luggage)
        : steal_check(worker2, guest2, luggage.inventory)
    } else if (guest2 != null && guest2.cooldown <= 0) {
      worker2 == null
        ? take_or_stash(guest2, rooms.all.grounds.actors.player_luggage)
        : steal_check(guest2, worker2, luggage.inventory)
    }
  }

  if (apple.passed == false) {
    if (
      injury.passed == true &&
      interval == 'turn' &&
      rooms.all['grounds'].stations.worker1 != ''
    ) {
      const replace = rooms.all.grounds.stations.aid
      if (
        replace != '' &&
        npcs.all[replace].clan != 'doctors' &&
        npcs.all[replace].currentroom != 'grounds'
      ) {
        //const docs = shuffle(npcs.return_doctors())
        const doc: Npc = shuffle(npcs.return_doctors())[0]
        let { currentroom, currentstation } = doc

        rooms.all[currentroom].stations[currentstation] = ''
        rooms.all.grounds.stations.aid = doc.labelname
        currentroom = 'grounds'
        currentstation = 'aid'
        npc_action_move(
          replace,
          surrounding_room_matrix(player.matrix, npcs.all[replace].matrix)
        )
      }
    }

    /**
     * so testjpf we have a propert that accepts multipl type of export functions and returns
     *
     * we then use one of those export functions, which has a more specific type.
     *
     * lint still thinks it's type is the original vague one
     */
    // eslint-disable-next-line @typescript-eslint/unbound-method
    // const _return_docs = npcs.return_doctors
    /*
    if (
      injury.passed == true &&
      interval == 'interact' &&
      apple.passed == true &&
      rooms.all['grounds'].stations.worker1 != '' &&
      player.inventory.includes('note') == false &&
      any_has_value([_return_docs, 'vial02']) == false
    ) {
      player.inventory.push('note')
      const params = {
        path: 'grounds/tutorialmeds',
        npc: rooms.all['grounds'].stations.aid,
        reason: 'apple',
        roomname: 'grounds',
      }
      msg.post('proxies:/controller#novelcontroller', 'show_scene', params)
    } else if (
      injury.passed == true &&
      interval == 'interact' &&
      apple.passed == true &&
      rooms.all['grounds'].stations.worker1 != '' &&
      player.inventory.includes('note') == true &&
      any_has_value([_return_docs, 'vial02']) == true
    ) {
      if (player.inventory.includes('note')) {
        const note = player.inventory.splice(
          player.inventory.indexOf('note'),
          1
        )
        npcs.all[rooms.all['grounds'].stations.aid].inventory.push(note[0])
      }
    }*/
  }
  medic_assist_checks()
}
function doctorsScripts() {
  const quest = tasks.quests.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {0:injury,1:doc,2: apple, 3: meds} = cons
  const { 0: injury, 2: apple } = cons
  // bad??:: if reasonstring.startswith('quest - ')
  //then on novel_main novel.quest.solution = endof(message.reason)

  if (injury.passed == true && apple.status == 'inactive') {
    novel.reason = 'quest'
    novel.priority = true
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    return 'tutorial/tutorialAdoctor'
  } else if (apple.status != 'inactive') {
    novel.priority = true
    novel.reason = 'quest'
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    return apple.passed == false ? 'tutorial/hungrydoc' : 'tutorial/getadoctor'
  }
  return null
}

function worker1Scripts() {
  const quest = tasks.quests.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {0:injury,1:doc,2: apple, 3: meds} = cons
  const { 0: injury } = cons
  if (injury.passed == false) {
    novel.priority = true
    novel.reason = 'quest'
    return 'tutorial/helpThatMan'
  }
  return null
}
function worker2Scripts() {
  //testjpf maybe have another fedUpLuggage that is majority alerts?
  //also, just add a lot more love chcks to the concern and offender
  //more alert checks as well
  //by checks i mean choices with checks

  if (novel.reason == 'concern') {
    novel.priority = true
    novel.reason = 'quest'
    return 'tutorial/concernLuggage'
  }

  return null
}

const tutorialAlookup: { [key: string]: () => string | null } = {
  doctors: doctorsScripts,
  worker2: worker2Scripts,
  worker1: worker1Scripts,
}

export function tutorialAscripts(actor: string): string[] {
  const scripts = []
  if (tutorialAlookup[actor] != null) scripts.push(tutorialAlookup[actor]())
  if (tutorialAlookup[npcs.all[actor].clan] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].clan]())
  if (tutorialAlookup[npcs.all[actor].currentstation] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].currentstation]())

  return scripts.filter((s: string | null): s is string => s != null)
}

export function tutorialB() {
  // tutorialA()
}
