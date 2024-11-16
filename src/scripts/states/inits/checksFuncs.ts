import WorldTasks from '../tasks'
import { Actor, Npc, PlayerState, Traits } from '../../../types/state'
import { Effect, Consequence, Task } from '../../../types/tasks'
import {
  removeAdvantageous,
  removeLast,
  removeOfValue,
  removeRandom,
  removeValuable,
} from '../../systems/inventorysystem'
import { fx } from '../../utils/consts'
import { rollSpecialDice } from '../../utils/dice'
import { shuffle, clamp } from '../../utils/utils'
import NpcState from '../npc'
import WorldPlayer from '../player'

export function confrontation_check(watcher: Traits, target: Traits): boolean {
  const { skills: ls, binaries: lb } = watcher
  const { skills: ts } = target

  const modifier = Math.round(
    lb.lawlessLawful * 5 - ts.speed + ls.speed - ls.constitution
  )
  const advantage = ls.speed + ls.constitution > ts.speed + lb.lawlessLawful * 5
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  const bossResult = rollSpecialDice(5, true, 4, 2)

  return bossResult >= result
}

export function addPledge(this: WorldTasks, t: string) {
  const target = this.parent.returnNpc(t)
  target.cooldown = target.cooldown + 8
  print(
    'OUTCOMES:: PLEDGED::',
    target.name,
    'pledged to be cool for::',
    target.cooldown
  )
}

export function pledgeCheck(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { skills: ls, binaries: lb } = this.parent.returnNpc(l).traits
  const { skills: ts, binaries: tb } =
    t === 'player'
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits

  const modifier = Math.round(
    lb.passiveAggressive * -5 + tb.passiveAggressive * 5
  )
  const advantage = ls.wisdom > ts.constitution + 2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -4, 3)

  print(
    'CHECKS:: PLEDGECHECK::',
    t,
    'pledged to do good by',
    l,
    'ROLL:',
    result
  )
  if (result > 5 && result <= 10) {
    this.outcomes.addPledge(t)
    return { pass: true, type: 'pledge' }
  }

  if (result > 10) {
    //print('SPECIAL pledge')
    this.outcomes.addPledge(t)
    this.outcomes.addPledge(t)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER pledge')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

export function playerSnitchCheck(
  this: WorldTasks,
  priors: boolean,
  cop: string,
  cause: string
): Consequence {
  ///testjpf still nrrd to figure out alert_level!!!
  //do alert_level search

  let caution_state = 'questioning'
  const player = this.parent.returnPlayer()
  if (player.alert_level > 3) caution_state = 'arrest'
  player.alert_level =
    priors == null ? player.alert_level + 1 : player.alert_level + 2
  if (player.alert_level > 5 && this.npcHasTask([cop], ['player']) == null) {
    this.taskBuilder(cop, 'snitch', 'player', cause)
  }
  print('plauer snitch chk :: alertlvl::', player.alert_level)
  return { pass: true, type: caution_state }
}
export function npcCommitSnitchCheck(
  this: WorldTasks,
  c: string,
  t: string
): Consequence {
  let caution_state = 'questioning'
  const cop = this.parent.returnNpc(c)
  const target = this.parent.returnNpc(t)
  if (this.npcHasTask([c], [t], ['questioning', 'arrest'])) {
    cop.traits.opinion[target.clan] = cop.traits.opinion[target.clan] - 1
    print('NPCSNITCHCHK')
    if (math.random() < 0.33) caution_state = 'arrest'
  }
  return { pass: true, type: caution_state }
}
//Checks and Helpers
//effects
function add_chaotic_good(_this: WorldTasks, t: string, l: string) {
  const listener = _this.parent.returnNpc(l)
  if (t != 'player') {
    const target = _this.parent.returnNpc(t)
    const effects_list = ['crimewave', 'inspired', 'eagleeye', 'modesty']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    listener.addOrExtendEffect(effect)
  } else {
    listener.love = listener.love - 2
  }
  print('OUTCOMES:: addchaoticgood::', t, 'inspired::', l, 'to be chaoticgood.')
}
export function chaotic_good_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { skills: ls, binaries: lb } = this.parent.returnNpc(l).traits
  const { binaries: tb } =
    t === 'player'
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits
  const modifier = Math.round(ls.wisdom / 2 + lb.evil_good * 5)
  const advantage = tb.anti_authority > lb.anti_authority
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  print('CHECKS RESULT::: chaoticgood::', result)
  if (result > 5 && result <= 10) {
    add_chaotic_good(this, t, l)
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
  print('OUTCOMES:: addumbcrook::', t, 'inspired::', l, 'to be dumbcrook.')
  const listener = _this.parent.returnNpc(l)
  if (t != 'player') {
    const target = _this.parent.returnNpc(t)
    const effects_list = ['admirer', 'opportunist', 'inspired', 'amped']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    listener.addOrExtendEffect(effect)
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
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits
  const modifier = Math.round(lb.lawlessLawful * -5)
  const advantage = tb.un_educated * -5 > ls.intelligence / 2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  print('CHECKS RESULT::: DUMBCROOK::', result)
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
  print('OUTCOMES:: ignorant::', t, 'inspired', l, 'to be ignorant')
  const listener = this.parent.returnNpc(l)
  if (t != 'player') {
    const effects_list = ['prejudice', 'incharge', 'boring', 'loudmouth']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion')
      effect.fx.stat = this.parent.returnNpc(t).clan
    listener.addOrExtendEffect(effect)
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
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits
  const modifier = Math.round(lb.un_educated * -5)
  const advantage = ts.intelligence > ls.perception
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)
  print('CHECKS RESULT::: Ignorant::', result)
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
  > = shuffle([decideToSnitchCheck, meritsDemerits, recklessCheck])
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

export function build_consequence(
  this: WorldTasks,
  t: Task,
  listener: string,
  checks: Array<(n: string, w: string) => Consequence>,
  precheck = false
): string {
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
export function decideToSnitchCheck(
  t: string,
  l: string,
  _this?: WorldTasks
): Consequence {
  const { skills: ls, binaries: lb } = _this!.parent.returnNpc(l).traits
  const { binaries: tb, skills: ts } =
    t === 'player'
      ? _this!.parent.returnPlayer().state.traits
      : _this!.parent.returnNpc(t).traits

  const modifier = Math.round(
    lb.anti_authority * 5 + (ls.constitution - ts.charisma) / 2
  )
  const advantage =
    ls.perception + Math.abs(lb.passiveAggressive * 5) >
    ts.stealth + +Math.abs(tb.passiveAggressive * 5)
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)
  print('CHECKS RESULT:::', t, ' is going to snitch on ', l, '::???', result)

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
      ? _this!.parent.returnPlayer().state.traits
      : _this!.parent.returnNpc(t).traits
  const modifier = Math.round((lb.evil_good + lb.lawlessLawful) * -2.5)
  const advantage =
    ls.constitution + (lb.passiveAggressive - tb.evil_good) * 5 > 7.5
  const result = rollSpecialDice(6, advantage, 3, 2) + clamp(modifier, -1, 1)
  print('CHECKS RESULT:::', l, 'decides MERITS OR DEMERITS for::', t, result)

  if (result < 4) {
    return { pass: true, type: 'demerits' }
  }

  if (result > 8) {
    return { pass: true, type: 'merits' }
  }

  return { pass: false, type: 'neutral' }
}
export function recklessCheck(
  t: string,
  l: string,
  _this?: WorldTasks
): Consequence {
  const { skills: ls, binaries: lb } = _this!.parent.returnNpc(l).traits
  const { binaries: tb, skills: ts } =
    t === 'player'
      ? _this!.parent.returnPlayer().state.traits
      : _this!.parent.returnNpc(t).traits

  const modifier = Math.round(
    lb.evil_good * -5 -
      ls.wisdom -
      ts.stealth +
      Math.abs(tb.passiveAggressive) * 5
  )
  const advantage = ls.intelligence < 5 || lb.lawlessLawful < -0.1
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('CHECKS RESULT:::', t, 'made,', l, ' RECKLESS::??', result)

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
function add_predator(this: WorldTasks, t: string, l: string) {
  const listener = this.parent.returnNpc(l)
  print('OUTCOMES:: Predator::', t, 'inspired', l, 'to be PREdATOR')

  if (t != 'player') {
    const target = this.parent.returnNpc(t)
    const effects_list = ['inspired', 'opportunist', 'vanity', 'inhiding']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    listener.addOrExtendEffect(effect)
  } else {
    listener.love = listener.love + 2
  }
}
export function predator_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { binaries: lb } = this.parent.returnNpc(l).traits
  const { binaries: tb } =
    t === 'player'
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits
  const modifier = Math.round(lb.evil_good * -5)
  const advantage = tb.anti_authority > lb.passiveAggressive
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  print('CHECKS RESULT::: ', t, 'made', l, 'PREDATOR::??', result)
  if (result > 5 && result <= 10) {
    add_predator
    return { pass: true, type: 'predator' }
  }

  if (result > 10) {
    // print('SPECIAL predator')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER predator')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_classy(_this: WorldTasks, t: string, l: string): void {
  const listener = _this.parent.returnNpc(l)
  print('OUTCOMES:: classy::', t, 'inspired', l, 'to be classy')

  if (t != 'player') {
    const target = _this.parent.returnNpc(t)
    const effects_list = ['crimewave', 'inshape', 'readup', 'modesty']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    //tesjpf need to add to npc and player
    // already have remove
    listener.addOrExtendEffect(effect)
  } else {
    listener.love = listener.love - 2
  }
}
export function classy_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { binaries: lb, skills: ls } = this.parent.returnNpc(l).traits
  const { skills: ts } =
    t === 'player'
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits
  const modifier = Math.round(lb.un_educated * 5)
  const advantage = ls.perception > ts.strength
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  if (result > 5 && result <= 10) {
    add_classy(this, t, l)
    return { pass: true, type: 'classy' }
  }

  if (result > 10) {
    // print('SPECIAL classy')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER classy')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
export function jailtime_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer() : this.parent.returnNpc(t)
  const { binaries: lb, skills: ls } = this.parent.returnNpc(l).traits
  const { skills: ts, binaries: tb } =
    t === 'player'
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits

  const modifier = Math.round(
    ls.perception - ts.perception + lb.anti_authority * 4
  )
  const advantage = tb.passiveAggressive < 0.2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -4, 2)
  print('CHECKS:: JAILTIMECHECK::', t, 'jailed by', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
    target.fsm.setState('arrestee')
    return { pass: true, type: 'jailed' }
  }

  if (result > 10) {
    target.fsm.setState('arrestee')
    target.hp = target.hp - 1
    //print('SPECIAL jailed')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER jailed')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
export function lConfrontPunchT(
  this: WorldTasks,
  t: string,
  //l: string,
  hit = 1
) {
  const target = this.parent.returnNpc(t)
  target.hp = target.hp - hit
  print('OUTCOMES:: LcT::', target.name, 'HITFOR::', hit)
}

export function getExtorted(this: WorldTasks, t: string, l: string): string {
  const tInv =
    t === 'player'
      ? this.parent.returnPlayer().state.inventory
      : this.parent.returnNpc(t).inventory
  const lInv = this.parent.returnNpc(l).inventory
  print('OUTCOMES:: ', t, 'GETSEXTORTED')
  return removeOfValue(tInv, lInv)
}

export function bribeCheck(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  //const target = this.parent.returnNpc(t)
  const { binaries: lb, skills: ls } = this.parent.returnNpc(l).traits
  const { binaries: tb, skills: ts } =
    t === 'player'
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits

  const modifier = Math.round(
    lb.lawlessLawful * -3 + (ls.strength - ts.strength / 2)
  )
  const advantage = tb.evil_good < lb.evil_good - 0.3
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  print('CHECKS:: BRIBECHECK::', t, 'asked for bribe by', l, 'ROLL:', result)
  if (result > 5 && result <= 10) {
    if (this.outcomes.getExtorted(t, l) == '') this.outcomes.lConfrontPunchT(t)
    return { pass: true, type: 'bribe' }
  }

  if (result > 10) {
    //print('SPECIAL bribe')
    this.outcomes.getExtorted(t, l)
    this.outcomes.lConfrontPunchT(t)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    this.outcomes.given_gift(t, l)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

export function tConfrontPunchL(this: WorldTasks, l: string, hit = 1) {
  const listener = this.parent.returnNpc(l)
  listener.hp = listener.hp - hit
  print('OUTCOMES:: TcL::', listener.name, 'HITFOR::', hit)
}
export function targetPunchedCheck(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { binaries: lb, skills: ls } = this.parent.returnNpc(l).traits
  const { binaries: tb, skills: ts } =
    t === 'player'
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits

  const modifier = Math.round(
    (ls.constitution - ts.speed) / 2 + lb.evil_good * -2
  )
  const advantage = tb.passiveAggressive < lb.passiveAggressive - 0.3
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  print(
    'CHECKS:: TPUCNHLCHK::',
    t,
    '(unless crit)punched by',
    l,
    'ROLL:',
    result
  )

  if (result > 5 && result <= 10) {
    this.outcomes.lConfrontPunchT(t, 1)
    return { pass: true, type: 'wPunchS' }
  }

  if (result > 10) {
    //print('SPECIAL wPunchS')
    this.outcomes.lConfrontPunchT(t, 3)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER wPunchS')
    this.outcomes.tConfrontPunchL(l, 2)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
// Misc. Checks
export function suspicious_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const { binaries: lb, skills: ls } = this.parent.returnNpc(l).traits
  const { binaries: tb, skills: ts } =
    t === 'player'
      ? this.parent.returnPlayer().state.traits
      : this.parent.returnNpc(t).traits

  const modifier = Math.round(
    ls.charisma -
      ts.charisma +
      ls.perception +
      (tb.passiveAggressive + lb.poor_wealthy) * 4
  )
  const advantage = lb.lawlessLawful > tb.lawlessLawful - 0.2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  if (result > 5 && result <= 10) {
    // create_suspicious(suspect, watcher)
    return { pass: true, type: 'suspicious' }
  }

  if (result > 10) {
    //print('SPECIAL suspicious')
    //  go_to_jail(suspect)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER suspicious')
    //shuffle(pos_consolations)[0](suspect)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

export function seen_check(
  //_this: WorldTasks,
  t: NpcState | PlayerState,
  watcher: NpcState
): { confront: boolean; type: string } {
  const target = t instanceof WorldPlayer ? t.state : t
  const { binaries: wb, skills: ws } = watcher.traits
  const { skills: ts, binaries: tb } = target.traits

  const heat = 'heat' in target ? target.heat * 10 : wb.poor_wealthy * -4

  const modifier = Math.round(
    ts.stealth + tb.lawlessLawful * -4 - ws.stealth - ws.perception - heat
  )
  const advantage =
    ts.speed - wb.lawlessLawful * 5 >
    ws.speed + ws.constitution + wb.passiveAggressive * 5

  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  if (result > 10) return { confront: false, type: 'seenspecial' }
  if (result < 0) return { confront: true, type: 'critcal' }
  const bossResult = rollSpecialDice(7, true, 3, 2)
  const seen = result <= bossResult
  return seen === true
    ? { confront: false, type: 'seen' }
    : { confront: false, type: 'neutral' }
}
export function take_check(taker: NpcState, actor: Npc | Actor) {
  const { skills, binaries } = taker.traits
  let modifier = Math.round(
    skills.stealth - skills.charisma + binaries.passiveAggressive * -5
  )
  if (taker.parent.npcHasTask([], [taker.name]) != null) {
    modifier = modifier - 1
  }
  const advantage = binaries.poor_wealthy + binaries.anti_authority * -1 > 0
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)
  if (result < 5) return false

  let chest_item = null
  if (math.random() < 0.5) {
    chest_item = removeValuable(taker.inventory, actor.inventory)
  } else if (math.random() < 0.51) {
    chest_item = removeAdvantageous(taker.inventory, actor.inventory, skills)
  } else {
    chest_item = removeRandom(taker.inventory, actor.inventory)
  }
  taker.addInvBonus(chest_item)
}

export function stash_check(stasher: NpcState, actor: NpcState | Actor) {
  let modifier = stasher.inventory.length - actor.inventory.length

  if (stasher.parent.npcHasTask([], [stasher.name]) != null) {
    modifier = modifier + 1
  }

  const advantage = actor.inventory.length < 2 || stasher.inventory.length > 5
  const result = rollSpecialDice(5, advantage, 3, 2) + modifier
  if (result < 5) return false

  let chest_item: string | null = null
  if (math.random() < 0.5) {
    chest_item = removeValuable(actor.inventory, stasher.inventory)
  } else if (math.random() < 0.51) {
    chest_item = removeAdvantageous(
      actor.inventory,
      stasher.inventory,
      stasher.traits.skills
    )
  } else {
    chest_item = removeLast(actor.inventory, stasher.inventory)
  }
  stasher.removeInvBonus(chest_item)
  // if victim == true ){ add_chest_bonus(n, chest_item) }
}
export function take_or_stash(attendant: NpcState, actor: NpcState | Actor) {
  if (
    actor.inventory.length > 0 &&
    (attendant.inventory.length == 0 || math.random() < 0.5)
  ) {
    take_check(attendant, actor)
  } else if (attendant.inventory.length > 0) {
    stash_check(attendant, actor)
  }
}
// only being used between npcs (just tutorial luggage)
//this.npcs.checks.stealCheck
export function npcStealCheck(
  // this: WorldTasks,
  target: NpcState,
  watcher: NpcState,
  loot: string[]
) {
  print(
    'npcSTEALchkLOOT:::',
    target.name,
    target.currRoom,
    watcher.name,
    watcher.currRoom,
    loot[0]
  )

  const { binaries: wb, opinion: wo } = watcher.traits
  const { skills: ts, binaries: tb, opinion: to } = target.traits

  if (target.cooldown > 0) return

  const modifier = Math.round(
    ts.speed +
      ts.stealth -
      target.cooldown +
      wo[target.clan] -
      to[watcher.clan] * 3
  )
  const advantage =
    tb.lawlessLawful + tb.evil_good - tb.poor_wealthy <
    wb.evil_good + wb.lawlessLawful
  const result =
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -3 ? modifier : -3)
  if (result < 5) return false
  const consequence = seen_check(target, watcher)
  print('SEENCHECK::', consequence.type)
  if (consequence.type == 'seen') {
    watcher.parent.taskBuilder(watcher.name, 'confront', target.name, 'theft')
    //testjpf is this used??
    target.loot = loot
  }
  if (consequence.type == 'neutral') {
    let chest_item = null
    print('CHESTCHKSFUNCS:::', loot[0])
    if (math.random() < 0.4) {
      chest_item = removeRandom(target.inventory, loot)
    } else if (math.random() < 0.5) {
      chest_item = removeValuable(target.inventory, loot)
    } else {
      chest_item = removeAdvantageous(target.inventory, loot, ts)
    }
    print('SEENCHECK CHEST::', consequence.type, chest_item)

    target.addInvBonus(chest_item)
    target.cooldown = math.random(5, 15)
  }

  target.cooldown = target.cooldown + 5
  print('SEENCHECK END::', consequence.type, target.cooldown)
}
function add_angel(listener: NpcState) {
  print('CCOUTCOME:: angel', listener)
  const effect: Effect = { ...fx.angel }
  listener.addOrExtendEffect(effect)
}
export function angel_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer().state : this.parent.returnNpc(t)
  const listener = this.parent.returnNpc(l)
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const modifier = Math.round(ts.wisdom - ls.wisdom)
  const advantage = Math.abs(tb.evil_good) > Math.abs(lb.evil_good)
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print(
    'CHECKS:: ANCGELCHK::',
    t,
    'is thought of as an angel by?',
    l,
    'ROLL:',
    result
  )
  if (result > 5 && result <= 10) {
    add_angel(listener)
    return { pass: true, type: 'angel' }
  }

  if (result > 10) {
    // print('SPECIAL angel')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER angel')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_vanity(listener: NpcState) {
  print('CCOUTCOME:: vanity has overtaken', listener)
  const effect: Effect = { ...fx.vanity }
  listener.addOrExtendEffect(effect)
}
export function vanity_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer().state : this.parent.returnNpc(t)
  const listener = this.parent.returnNpc(l)
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const modifier = Math.round(ts.charisma - ls.intelligence + lb.evil_good * -5)
  const advantage =
    ts.strength + tb.un_educated * 5 > ls.strength + lb.un_educated * 5
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 2)

  print('CHECKS:: ANCGELCHK::', t, 'has made vane::', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
    add_vanity(listener)
    return { pass: true, type: 'vanity' }
  }

  if (result > 10) {
    // print('SPECIAL VANITY')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER VANITY')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_admirer(tClan: string, listener: NpcState) {
  print('OUTCOMESADMIRE::', listener.name, 'has admiration for:', tClan)
  if (tClan === 'player') {
    listener.love++
    return
  }
  const effect: Effect = { ...fx.admirer }
  effect.fx.stat = tClan
  listener.addOrExtendEffect(effect)
}
export function admirer_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer().state : this.parent.returnNpc(t)
  const listener = this.parent.returnNpc(l)
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts } = target.traits
  const modifier = Math.round(
    ts.charisma - ls.charisma + lb.anti_authority * -5
  )
  const advantage = ts.intelligence > ls.perception && ls.strength < 5
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('CHECKS:: ADMIRERCHK::', t, 'is admired by::', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
    add_admirer(target instanceof NpcState ? target.clan : 'player', listener)
    return { pass: true, type: 'admirer' }
  }

  if (result > 10) {
    // print('SPECIAL ADMIRERER')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER ADMIRERER')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
export function add_prejudice(tClan: string, listener: NpcState) {
  print('OUTCOME:: is prejudiced', listener)
  if (tClan === 'player') {
    listener.love--
    return
  }
  const effect: Effect = { ...fx.prejudice }
  effect.fx.stat = tClan
  listener.addOrExtendEffect(effect)
}
export function prejudice_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer().state : this.parent.returnNpc(t)
  const listener = this.parent.returnNpc(l)
  const { skills: ls, binaries: lb } = listener.traits
  const { binaries: tb } = target.traits

  const modifier = Math.round(lb.poor_wealthy * -5 + tb.poor_wealthy * -5)
  const advantage = ls.wisdom + ls.charisma < ls.stealth / 2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  print('CHECKS:: PREJUDICECHK::', t, 'is hated by::', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
    add_prejudice(target instanceof NpcState ? target.clan : 'player', listener)
    return { pass: true, type: 'prejudice' }
  }

  if (result > 10) {
    // print('SPECIAL prejudice')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER prejudice')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

export function watcher_punched_check(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer().state : this.parent.returnNpc(t)
  const listener = this.parent.returnNpc(l)
  const { skills: ls } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const modifier = Math.round(
    tb.lawlessLawful * -5 + ts.strength - ls.strength - ls.wisdom
  )
  const advantage = tb.passiveAggressive * 7 > ls.speed
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  print('CHECKS:: Listenerpunched::', t, 'hits::', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
    this.outcomes.tConfrontPunchL(listener.name, 1)
    return { pass: true, type: 'sPunchW' }
  }

  if (result > 10) {
    //print('SPECIAL sPunchW')
    this.outcomes.tConfrontPunchL(listener.name, 3)

    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER sPunchW')
    this.outcomes.lConfrontPunchT(target.name, 2)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

function call_security(_this: WorldTasks, w: string, suspect: string) {
  const watcher = _this.parent.returnNpc(w)
  watcher.clan == 'security'
    ? _this.methods.returnNpc(suspect).fsm.setState('arrestee')
    : _this.taskBuilder(
        watcher.name,
        math.random() > 0.33 ? 'questioning' : 'arrest',
        suspect,
        'unlucky'
      )
}

export function unlucky_check(
  this: WorldTasks,
  l: string,
  t: string
): Consequence {
  const modifier = math.random(-1, 1)
  const advantage = math.random() > 0.5
  const result = rollSpecialDice(5, advantage, 3, 2) + modifier

  print('CHECKS:: UNLUCKEY::', t, 'is unlucky with::', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
    const random = math.random(0, 4)
    if (random == 0) {
      print('unlucky 0 getextorted')

      this.outcomes.getExtorted(t, l)
    } else if (random == 1) {
      print('unlucky 1 lConfrontPunchT')

      this.outcomes.lConfrontPunchT(t)
    } else if (random == 2) {
      print('unlucky 2 addPledge')

      this.outcomes.addPledge(t)
    } else if (random == 3) {
      print('unluck 3 callsecurity')
      call_security(this, l, t)
    } else if (random == 4) {
      print('unluck 4 addprejudice')

      this.outcomes.add_prejudice(
        t === 'player' ? t : this.parent.returnNpc(t).clan,
        this.parent.returnNpc(l)
      )
    }
    return { pass: true, type: 'unlucky' }
  }

  if (result > 10) {
    print('SPECIAL unlucky')
    call_security(this, t, l)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER unlucky')

    shuffle([
      this.checks.charmed_merits.bind(this),
      this.checks.ap_boost.bind(this),
      this.outcomes.given_gift.bind(this),
      this.checks.love_boost.bind(this),
    ])[0](t, l)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

export function becomeASnitchCheck(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer().state : this.parent.returnNpc(t)
  const listener = this.parent.returnNpc(l)
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const modifier = Math.round(
    lb.anti_authority * 5 + (ls.constitution - ts.charisma) / 2
  )
  const advantage =
    ls.perception + Math.abs(lb.passiveAggressive * 5) >
    ts.stealth + +Math.abs(tb.passiveAggressive * 5)
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

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

export function love_boost(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer().state : this.parent.returnNpc(t)
  const listener = this.parent.returnNpc(l)
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const modifier = Math.round(Math.abs(tb.evil_good) * 10 - ls.speed)
  const advantage =
    ts.charisma + ts.intelligence + lb.anti_authority * 10 >
    ls.intelligence + ls.perception + ts.speed
  const result = math.min(
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -2 ? modifier : -2),
    rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  )

  if (result > 5 && result <= 10) return { pass: true, type: 'loveboost' }

  if (result > 10) return { pass: true, type: 'special' }
  return { pass: false, type: 'neutral' }
}
export function ap_boost(this: WorldTasks, t: string, l: string): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer().state : this.parent.returnNpc(t)
  const listener = this.parent.returnNpc(l)
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const modifier = Math.round(
    ts.constitution + listener.love + (lb.passiveAggressive * 10) / 3
  )
  const advantage =
    tb.passiveAggressive + lb.passiveAggressive > 0.1 &&
    ls.constitution > ts.speed
  const result =
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1)

  if (result > 5 && result <= 10) return { pass: true, type: 'apboost' }

  if (result > 10) return { pass: true, type: 'special' }
  return { pass: false, type: 'neutral' }
}
export function charmed_merits(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer().state : this.parent.returnNpc(t)
  const listener = this.parent.returnNpc(l)
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts } = target.traits

  const modifier = Math.round(
    (ts.charisma + listener.love) / 2 - ls.constitution
  )
  const advantage = ts.charisma > ls.charisma && lb.un_educated < -0.1
  const result =
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1)

  if (result > 5 && result <= 10) return { pass: true, type: 'merits' }

  if (result > 10) return { pass: true, type: 'special' }

  return { pass: false, type: 'neutral' }
}
export function given_gift(
  this: WorldTasks,
  t: string,
  l: string
): Consequence {
  const target =
    t === 'player' ? this.parent.returnPlayer() : this.parent.returnNpc(t)

  const listener = this.parent.returnNpc(l)
  //testjpf check if inventory full?!
  let gift = removeAdvantageous(
    target.inventory,
    listener.inventory,
    target instanceof WorldPlayer
      ? target.state.traits.skills
      : target.traits.skills
  )

  if (gift == null) gift = math.random() < 0.5 ? 'berry02' : 'coingold'
  target.inventory.push(gift)
  target.addInvBonus(gift)

  return { pass: true, type: 'gift' }
}
