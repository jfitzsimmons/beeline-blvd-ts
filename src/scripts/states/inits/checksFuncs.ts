//testjpf move 2 checks to parent
//use new init
// will need individual method Types 'per task'
// some tasks wont have any

import { Effect, Consequence, Task } from '../../../types/tasks'
import { fx } from '../../utils/consts'
import { rollSpecialDice } from '../../utils/dice'
import { shuffle, clamp } from '../../utils/utils'
import WorldTasks from '../tasks'

//need to send cause TESTJPF
export function playerSnitchCheck(
  this: WorldTasks,
  priors: boolean,
  cop: string,
  cause: string
): string {
  ///testjpf still nrrd to figure out alert_level!!!
  //do alert_level search

  let caution_state = 'questioning'
  const player = this.parent.returnPlayer()
  if (player.alert_level > 3) caution_state = 'arrest'
  player.alert_level =
    priors == null ? player.alert_level + 1 : player.alert_level + 2
  if (player.alert_level > 5 && this.npcHasTask(cop, 'player') == null) {
    this.taskBuilder(cop, 'snitch', 'player', cause)
  }
  print('plauer snitch chk :: alertlvl::', player.alert_level)
  return caution_state
}
//need to send target TESTJPF
export function npcSnitchCheck(this: WorldTasks, c: string, t: string): string {
  let caution_state = 'questioning'
  const cop = this.parent.returnNpc(c)
  const target = this.parent.returnNpc(t)
  if (this.npcHasTask(c, t, ['questioning', 'arrest'])) {
    cop.traits.opinion[target.clan] = cop.traits.opinion[target.clan] - 1
    print('NPCSNITCHCHK')
    if (math.random() < 0.33) caution_state = 'arrest'
  }
  return caution_state
}

//Checks and Helpers
//effects
function add_chaotic_good(this: WorldTasks, t: string, l: string) {
  const listener = this.parent.returnNpc(l)
  if (t != 'player') {
    const target = this.parent.returnNpc(t)
    const effects_list = ['crimewave', 'inspired', 'eagleeye', 'modesty']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    listener.add_effects_bonus(effect)
    listener.effects.push(effect)
  } else {
    listener.love = listener.love - 2
  }
}
export function chaotic_good_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { skills: ls, binaries: lb } = this.parent.returnNpc(l).traits
  const { binaries: tb } =
    t === 'player'
      ? this.parent.returnPlayer().traits
      : this.parent.returnNpc(t).traits
  const modifier = Math.round(ls.wisdom / 2 + lb.evil_good * 5)
  const advantage = tb.anti_authority > lb.anti_authority
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('TESTJPF RESULT::: chaoticgood::', result)
  if (result > 5 && result <= 10) {
    //testjpf did these ever work?
    //fill args@!!!!!!
    //can use task builder?
    add_chaotic_good
    return { pass: true, type: 'chaoticgood' }
  }

  if (result > 10) {
    // print('SPECIAL chaoticgood')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER chaoticgood')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_dumb_crook(_this: WorldTasks, t: string, l: string) {
  const listener = _this.parent.returnNpc(l)
  if (t != 'player') {
    const target = _this.parent.returnNpc(t)
    const effects_list = ['admirer', 'opportunist', 'inspired', 'amped']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    listener.add_effects_bonus(effect)
    listener.effects.push(effect)
  } else {
    listener.love = listener.love + 2
  }
}
export function dumb_crook_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { skills: ls, binaries: lb } = this.parent.returnNpc(l).traits
  const { binaries: tb } =
    t === 'player'
      ? this.parent.returnPlayer().traits
      : this.parent.returnNpc(t).traits
  const modifier = Math.round(lb.lawlessLawful * -5)
  const advantage = tb.un_educated * -5 > ls.intelligence / 2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('TESTJPF RESULT::: dumbcrook::', result)
  if (result > 5 && result <= 10) {
    add_dumb_crook(this, t, l)
    return { pass: true, type: 'dumbcrook' }
  }

  if (result > 10) {
    // print('SPECIAL dumbcrook')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER dumbcrook')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_ignorant(this: WorldTasks, t: string, l: string) {
  const listener = this.parent.returnNpc(l)
  if (t != 'player') {
    const effects_list = ['prejudice', 'incharge', 'boring', 'loudmouth']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion')
      effect.fx.stat = this.parent.returnNpc(t).clan
    listener.add_effects_bonus(effect)
    listener.effects.push(effect)
  } else {
    listener.love = listener.love + 2
  }
}
export function ignorant_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { skills: ls, binaries: lb } = this.parent.returnNpc(l).traits
  const { skills: ts } =
    t === 'player'
      ? this.parent.returnPlayer().traits
      : this.parent.returnNpc(t).traits
  const modifier = Math.round(lb.un_educated * -5)
  const advantage = ts.intelligence > ls.perception
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('TESTJPF RESULT::: ignorant::', result)
  if (result > 5 && result <= 10) {
    add_ignorant
    return { pass: true, type: 'ignorant' }
  }

  if (result > 10) {
    // print('SPECIAL ignorant')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER ignorant')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

//Confrontation /security
function thief_consolation_checks(_this: WorldTasks, t: string, l: string) {
  const tempcons: Array<
    (t: string, l: string, _this?: WorldTasks) => Consequence
  > = shuffle([snitch_check, meritsDemerits, recklessCheck])
  //    shuffle(thief_consolations)

  for (const check of tempcons) {
    const consolation = check(t, l, _this)
    if (consolation.pass == true) {
      print('EMsys::: thief_consolation_checks::', consolation.type)
      return consolation.type
    }
  }
  print('did nothing after witnessing a theft attempt')
  return 'neutral'
}
//TESTJPF suspected BUG here!! need to pass watcher
//this is creating cautions for the wrong npc???
export function build_consequence(
  this: WorldTasks,
  t: Task,
  listener: string,
  checks: Array<(n: string, w: string) => Consequence>,
  precheck = false
) {
  let consolation = { pass: precheck, type: 'neutral' }

  for (let i = checks.length; i-- !== 0; ) {
    consolation = checks[i](t.target, listener)
    print(
      i,
      '-- buildconsequence::: ARGCHECKS::',
      consolation.pass,
      consolation.type,
      t.target,
      listener
    )
    if (consolation.pass == true) i = 0
  }

  if (consolation.pass == false) {
    //if (t.target != 'player') {
    print('buildconsequence::: prethief::', consolation.pass, consolation.type)

    consolation.type = thief_consolation_checks(this, t.target, listener)
    print('buildconsequence::: postthief::', consolation.pass, consolation.type)

    if (consolation.type != 'neutral') {
      //this will probably be new tasks()
      this.taskBuilder(listener, consolation.type, t.target, t.cause)
      t.turns = 0
    } else {
      //print(t.label, t.cause, 'ANY_consequence: no fx or cautions')
    }
    //} else {
    //  npcs.all[t.owner].love = npcs.all[t.owner].love - 1
    // }
  }
  //print('BUILD CONEQUENCE return type::', consolation.type)
  return consolation.type
}

export function snitch_check(
  t: string,
  l: string,
  _this?: WorldTasks
): Consequence {
  const { skills: ls, binaries: lb } = _this!.parent.returnNpc(l).traits
  const { binaries: tb, skills: ts } =
    t === 'player'
      ? _this!.parent.returnPlayer().traits
      : _this!.parent.returnNpc(t).traits

  const modifier = Math.round(
    lb.anti_authority * 5 + (ls.constitution - ts.charisma) / 2
  )
  const advantage =
    ls.perception + Math.abs(lb.passiveAggressive * 5) >
    ts.stealth + +Math.abs(tb.passiveAggressive * 5)
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  //print('TESTJPF RESULT::: snitch', result)
  if (result > 5 && result <= 10) {
    return { pass: true, type: 'snitch' }
  }

  if (result > 10) {
    //print('SPECIAL snitch')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER snitch')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

function meritsDemerits(t: string, l: string, _this?: WorldTasks): Consequence {
  const { skills: ls, binaries: lb } = _this!.parent.returnNpc(l).traits
  const { binaries: tb } =
    t === 'player'
      ? _this!.parent.returnPlayer().traits
      : _this!.parent.returnNpc(t).traits
  const modifier = Math.round((lb.evil_good + lb.lawlessLawful) * -2.5)
  const advantage =
    ls.constitution + (lb.passiveAggressive - tb.evil_good) * 5 > 7.5
  const result = rollSpecialDice(6, advantage, 3, 2) + clamp(modifier, -1, 1)
  //print('TESTJPF RESULT::: evilmerits', result)
  if (result < 4) {
    return { pass: true, type: 'demerits' }
  }

  if (result > 8) {
    return { pass: true, type: 'merits' }
  }

  return { pass: false, type: 'neutral' }
}

export function recklessCheck(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { skills: ls, binaries: lb } = this.parent.returnNpc(l).traits
  const { binaries: tb, skills: ts } =
    t === 'player'
      ? this.parent.returnPlayer().traits
      : this.parent.returnNpc(t).traits

  const modifier = Math.round(
    lb.evil_good * -5 -
      ls.wisdom -
      ts.stealth +
      Math.abs(tb.passiveAggressive) * 5
  )
  const advantage = ls.intelligence < 5 || lb.lawlessLawful < -0.1
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  //print('TESTJPF RESULT::: reckless', result)
  if (result > 5 && result <= 10) {
    return { pass: true, type: 'reckless' }
  }

  if (result > 10) {
    //print('SPECIAL reckless')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER reckless')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
