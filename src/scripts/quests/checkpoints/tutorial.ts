import { QuestConditions } from '../../../types/tasks'
import { steal_check, take_or_stash } from '../../ai/ai_checks'
import QuestStep from '../../states/questStep'
//import { npc_action_move } from '../../ai/ai_main'
//import NpcState from '../../states/npc'
import { from_same_room } from '../../utils/quest'
//import { shuffle } from '../../utils/utils'

const { rooms, npcs, tasks, player, novel, info, quests } =
  globalThis.game.world
function injured_checks(conditions: QuestConditions) {
  const { '0': injury, '1': doc } = conditions
  const quest = quests.all.tutorial.medic_assist
  /**  if (quest.passed == false) {
     //overly cautious? TESTJPF make sure injured doesnt get into other trouble???
     tasks.remove_heat(injured.labelname)
   }**/
  //need doctor checks and "non-doctor" cjecks?
  //testjpf if novel.npc isn't a doctor::: RETURN!!!????
  const injured = npcs.all[rooms.all.grounds.stations.worker1]
  // BUG::: testjpf I think this will
  // let you interact with any doctor
  //const doctor = npcs.all[novel.npc.labelname]

  // const { conditions: cons } = quest
  //const {"0":injury,"1":doc, "2":apple} = cons

  if (injury.fsm.getState() == 'standby' && injury.passed == true) {
    //todo testjpf should all be condition FSM states!!!
    injury.fsm.setState('active')
    quest.fsm.setState('active')
    doc.fsm.setState('standby')
    injured.love = injured.love + 1
    info.add_interaction(
      `${injured.labelname} likes that you are helping them.`
    )
  }
}
function infirmary_checks(delivery: QuestStep) {
  print(
    'INFIRMARY CHECKS::: reaon / delivery::',
    novel.reason,
    delivery.fsm.getState()
  )
  if (
    //testjpf this only works if talking to doctors
    // doctor sripts only gets called for doctors!!!
    novel.reason == 'favormedquest' &&
    delivery.fsm.getState() == 'inactive'
  ) {
    delivery.fsm.setState('active')
    player.add_inventory('vial02')

    //info.add_interaction(`${doctor.labelname}'s gave you clearance for 8 turns`)
  }
}
function doctor_checks(conditions: QuestConditions) {
  //const quest = quests.all.tutorial.medic_assist

  const injured = npcs.all[rooms.all.grounds.stations.worker1]
  // BUG::: testjpf I think this will
  // let you interact with any doctor
  const doctor = npcs.all[novel.npc.labelname]
  const { '0': injury, '2': apple, '3': meds } = conditions
  // testjpf future have side_quesct_checks()????

  if (
    //TESTJPF !!! Here is where you would have the other options
    // not just apple, but bribe, drugs...
    novel.reason == 'hungrydoc' &&
    injury.fsm.getState() == 'active' &&
    apple.fsm.getState() == 'inactive'
  ) {
    apple.fsm.setState('active')
    //testjpf ABOVE IS FSM TODO
    // i think jsut sets novel.reason in script builder.
    //So for 100  turns, this npc will always talk to you about a quest
    //which quest? the one that comes from quest directory scripts
    // as seen in sbuilder:: const quest_paths
    //testjpf need to debug txt scripts related to this quest
    /**tasks.append_task({
      label: 'quest',
      turns: 100,
      scope: 'hungry',
     cause: 'quest',
      owner: doctor.labelname,
      target: doctor.labelname,
      authority: 'player',
    })**/
    //I think we'll still need something like this.
    // probably doesnt need to be so general.
    // could be a simple as creating new Task() that has own FSM//
    //NOT BAD.
    tasks.task_builder(doctor, 'quest', injured.labelname, 'quest')
    novel.append_npc_quest(doctor.labelname)

    info.add_interaction(`${doctor.labelname} needs drugs, money or food.`)
    //info.build_objectives(tasks.quests)
    //testjpf
    // need something to check if this doc was given food.
    // in 'interact' gui send message to exit gui??
    // containing item, maybe who from "npc" or "player"
  } else if (
    //TESTJPF !!! Here is where you would have the other options
    // not just apple, but bribe, drugs...
    novel.reason == 'druggiedoc' &&
    apple.fsm.getState() == 'inactive'
  ) {
    apple.fsm.setState('active')
    //testjpf
    // i think jsut sets novel.reason in script builder.
    //So for 100  turns, this npc will always talk to you about a quest
    //which quest? the one that comes from quest directory scripts
    // as seen in sbuilder:: const quest_paths
    //testjpf need to debug txt scripts related to this quest
    /**tasks.append_task({
      label: 'quest',
      turns: 100,
      scope: 'hungry',
     cause: 'quest',
      owner: doctor.labelname,
      target: doctor.labelname,
      authority: 'player',
    })*/
    novel.append_npc_quest(doctor.labelname)
    tasks.task_builder(doctor, 'quest', injured.labelname, 'quest')

    info.add_interaction(`${doctor.labelname} needs drugs, money or food.`)
    //info.build_objectives(tasks.quests)
    //testjpf
    // need something to check if this doc was given food.
    // in 'interact' gui send message to exit gui??
    // containing item, maybe who from "npc" or "player"
    //testjpf add same conditons for drugs and money
    //and change inactive to standby???
  } else if (
    apple.fsm.getState() == 'active' &&
    novel.item == 'apple01' &&
    apple.passed == false
  ) {
    //check if last item clicked was apple? testjpf
    //TESTJPF Pass condition is changed HERE not in statekj
    apple.passed = true

    //tasks.remove_quest_cautions(doctor.labelname)
    novel.remove_npc_quest(doctor.labelname)
    tasks.remove_quest_tasks(doctor.labelname)

    novel.reason = 'getadoctor'
    info.add_interaction(`${doctor.labelname} likes that you fed them.`)
    doctor.love = doctor.love + 1

    // testjpf this is overwriting my scriptsdialog functions
    novel.npc = doctor
    novel.priority = true
    tasks.append_task({
      label: 'mending',
      turns: 100,
      scope: 'quest',
      cause: 'field',
      owner: doctor.labelname,
      target: injured.labelname,
      authority: 'doctors',
    })
    info.add_interaction(`${injured.labelname} likes that you got a doctor.`)
    injured.love = injured.love + 1
    msg.post('proxies:/controller#novelcontroller', 'show_scene')
    // complete after talking

    //testjpf open dialog with thanks and next task???
    // use novel_init here jsut to laod the same tutorial/
    //testjpf
    // need something to check if this doc was given food.
    // in 'interact' gui send message to exit gui??
    // containing item, maybe who from "npc" or "player"
  } else if (
    novel.reason == 'getsomemeds' &&
    meds.fsm.getState() == 'inactive'
  ) {
    meds.fsm.setState('active')
    apple.fsm.setState('complete')
    player.add_inventory('note')
    print(
      'TRY TO MOVE:',
      doctor.labelname,
      'from:',
      doctor.currentstation,
      'to worker1'
    )

    tasks.append_task({
      label: 'clearance',
      turns: 8,
      scope: 'type3',
      cause: 'medical',
      owner: doctor.labelname,
      target: 'player',
      authority: 'security',
    })
    novel.remove_npc_quest(doctor.labelname)
    tasks.remove_quest_tasks(doctor.labelname)
    novel.append_npc_quest(doctor.labelname)
    tasks.task_builder(doctor, 'quest', injured.labelname, 'waitingformeds')

    /** 
    tasks.append_task({
      label: 'quest',
      turns: 50,
      scope: 'medassist',
     cause: 'medical',
      owner: doctor.labelname,
      target: doctor.labelname,
      authority: 'player',
    })*/
    info.add_interaction(`${doctor.labelname}'s gave you clearance for 8 turns`)

    //TESTJPF ACTIVEATE SIDE QUEST HERE
    //not in else ifs
    // quest.side_quests![1].fsm.getState() = 'active'

    player.clearance = 3

    msg.post(`/${doctor.currentstation}#npc_loader`, hash('move_npc'), {
      station: 'worker1',
      owner: doctor.labelname,
    })

    // create caution for... 10 turns?
    // i don't have cleareance logic setup!!
    //testjpf add "note" to inventory
  } else if (novel.reason == 'rejectmeds') {
    apple.fsm.setState('complete')
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
      owner: doctor.labelname,
    })
    // create caution for... 10 turns?
    // i don't have cleareance logic setup!!
    //testjpf add "note" to inventory
  } else if (
    // quest.side_quests![1].fsm.getState() == 'active' &&
    meds.fsm.getState() == 'active' &&
    player.clearance - 3 < rooms.all[player.currentroom].clearance &&
    from_same_room(npcs.return_security(), player.currentroom) != null
  ) {
    novel.caution.label = 'questioning'
    novel.reason = 'tutsclearance'
    novel.priority = true
    novel.npc = from_same_room(npcs.return_security(), player.currentroom)!
    //quest.side_quests![1].passed = true
    // quest.side_quests![1].fsm.getState() = 'complete'

    msg.post('proxies:/controller#novelcontroller', 'show_scene')
  } else if (
    meds.fsm.getState() == 'active' &&
    novel.item == 'vial02' &&
    meds.passed == true
  ) {
    novel.priority = true
    //TESTjpf start here
    const waiting = tasks.task_has_npc('waitingformeds')
    //testjpf doesnt work if you talk to someone else!!! BUG
    if (novel.npc.labelname == waiting) {
      print('WAITING DOES ANYHTING???!!!')
      //meds.passed = true
      meds.fsm.setState('complete')
      info.add_interaction(`${waiting} likes that you gave them meds.`)
      doctor.love = doctor.love + 1
      novel.npc = npcs.all[waiting]
      novel.reason = 'docquestcomplete'
      novel.remove_npc_quest(doctor.labelname)
      tasks.remove_quest_tasks(doctor.labelname)
    } else {
      //testjpf start here
      //set up address)cautions for favors and quests TODO
      // need to really think out logic here
      /**
       * youd talk to them (reason = quest, label queststart)((doctorsScripts!!!))
       * if accept reason = quest: favormedquest
       * this creates favor caution
       * address_cautions should look for nearby docs
       * decide wether to give them meds,
       * (if they even haven't lost the yet)
       * if so, goal passed = true
       * quest complete when talk to doc again?? with timeout??
       * remove any related npcs from npcsWithQuest
       */
      // testjpf this is overwriting my scriptsdialog functions
      novel.npc = doctor
      //novel.priority = true
      tasks.append_task({
        label: 'favor',
        turns: 15,
        scope: 'quest',
        cause: 'favordoctorquest',
        owner: doctor.labelname,
        target: npcs.all[waiting!].labelname,
        authority: 'player',
      })
      novel.reason = 'askdocafavor'
    }
    novel.priority = true
    msg.post('proxies:/controller#novelcontroller', 'show_scene')
    // removed after scene
    if (waiting != null) {
      tasks.remove_quest_tasks(waiting)
      novel.remove_npc_quest(waiting)
    }
  }
}
function medic_assist_checks() {
  const quest = quests.all.tutorial.medic_assist
  /**  if (quest.passed == false) {
    //overly cautious? TESTJPF make sure injured doesnt get into other trouble???
    tasks.remove_heat(injured.labelname)
  }**/
  //need doctor checks and "non-doctor" cjecks?
  //testjpf if novel.npc isn't a doctor::: RETURN!!!????
  // const injured = npcs.all[rooms.all.grounds.stations.worker1]
  // BUG::: testjpf I think this will
  // let you interact with any doctor
  //const doctor = npcs.all[novel.npc.labelname].

  const { conditions: cons } = quest
  //const {"0":injury,"1":doc, "2":apple} = cons
  //const { "0": injury, "1": doc, "2": apple, "3": meds } = cons
  if (cons['0'].passed == true) injured_checks(cons)
  if (npcs.all[novel.npc.labelname].clan == 'doctors') {
    doctor_checks(cons)
  } else if (npcs.all[novel.npc.labelname].currentroom == 'infirmary') {
    print('novel reason pre infirm check', novel.reason)
    infirmary_checks(cons[5])
  }
  //TESTJPF ELSE if quest complete dialog, xp / money???
}

export function tutorialA(interval = 'turn') {
  const quest = quests.all.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {"0":injury,"1":doc,"2": apple, "3": meds} = cons
  const { '2': apple } = cons
  //testjpg NEW move rooms logic to grounds room state?
  //logic makes sense. these are dice rolls
  //add remove item methods for all states!!! todo
  //grounds.fsm.setState('quest')???
  //attach at least some quest stuff to room/rooms makes sense

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
    /**   if (
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
        const doc: NpcState = shuffle(npcs.return_doctors())[0]
        let { currentroom, currentstation } = doc
        //BAD should be handled by set doc npc state
        //TODO TESTjpf
        rooms.all[currentroom].stations[currentstation] = ''
        rooms.all.grounds.stations.aid = doc.labelname
        currentroom = 'grounds'
        currentstation = 'aid'*/
    /**todo testjpf ≈
        npc_action_move(
          replace,
          surrounding_room_matrix(player.matrix, npcs.all[replace].matrix)
        )√*/
    //   }
    //  }
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
        owner: rooms.all['grounds'].stations.aid,
       cause: 'apple',
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
  const quest = quests.all.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {"0":injury,"1":doc,"2": apple, "3": meds} = cons
  const { '0': injury, '2': apple } = cons
  // bad??:: if reasonstring.startswith('quest - ')
  //then on novel_main novel.quest.solution = endof(message.reason)

  if (injury.passed == true && apple.fsm.getState() == 'inactive') {
    novel.reason = 'quest'
    novel.priority = true
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    return 'tutorial/tutorialAdoctor'
  } else if (apple.fsm.getState() == 'active') {
    novel.priority = true
    novel.reason = 'quest'
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    //testjpf future naming files may be better:
    //docAsksForFavor, docActiveFavor
    return apple.passed == false ? 'tutorial/hungrydoc' : 'tutorial/getadoctor'
  } else if (cons[5].fsm.getState() == 'active') {
    novel.priority = true
    novel.reason = 'quest'
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc

    //testjpf future naming files may be better:
    //docAsksForFavor, docActiveFavor
    return tasks.task_has_npc('waitingformeds') == null
      ? 'tutorial/askDocAfavor'
      : 'tutorial/medAssistComplete'
  }
  return null
}

function infirmaryScripts() {
  const quest = quests.all.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {"0":injury,"1":doc,"2": apple, "3": meds} = cons
  const { '3': meds } = cons
  if (
    meds.fsm.getState() == 'active' &&
    novel.npc.currentstation == 'assistant'
  ) {
    novel.priority = true
    novel.reason = 'quest'
    return 'tutorial/giveMeMeds'
  }
  return null
}

function worker1Scripts() {
  const quest = quests.all.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {"0":injury,"1":doc,"2": apple, "3": meds} = cons
  const { '0': injury } = cons
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
  //assistant: assistantScripts,
  doctors: doctorsScripts,
  worker2: worker2Scripts,
  worker1: worker1Scripts,
  infirmary: infirmaryScripts,
}

export function tutorialAscripts(actor: string): string[] {
  const scripts = []
  if (tutorialAlookup[actor] != null) scripts.push(tutorialAlookup[actor]())
  if (tutorialAlookup[npcs.all[actor].clan] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].clan]())
  if (tutorialAlookup[npcs.all[actor].currentstation] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].currentstation]())
  if (tutorialAlookup[npcs.all[actor].currentroom] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].currentroom]())

  return scripts.filter((s: string | null): s is string => s != null)
}

export function tutorialB() {
  // tutorialA()
}
