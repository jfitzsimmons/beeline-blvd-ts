import { Traits } from '../../../types/state'
import { Effect, Consequence } from '../../../types/tasks'
import {
  removeAdvantageous,
  removeOfValue,
  removeValuable,
} from '../../utils/inventory'
import { fx } from '../../utils/consts'
import { roll_dice, ROLLODDS, rollSpecialDice } from '../../utils/dice'
import { shuffle, clamp } from '../../utils/utils'
import { QuestionProps } from '../../../types/behaviors'
import { AttendantProps, ThiefVictimProps } from '../../../types/ai'
import Storage from '../storage'
import { crimeSeverity } from '../../utils/ai'

export const crimeChecks: {
  [key: string]: Array<
    (
      chkr: QuestionProps,
      chkd: QuestionProps
    ) => { pass: boolean; type: string }
  >
} = {
  clearance: [
    pledgeCheck,
    ...shuffle([bribeCheck, targetPunchedCheck, prejudice_check]),
    unlucky_check,
    admirer_check,
    recklessCheck,
    jailtime_check,
  ],
  concern: [
    pledgeCheck,
    ...shuffle([
      bribeCheck,
      targetPunchedCheck,
      admirer_check,
      prejudice_check,
      unlucky_check,
      recklessCheck,
    ]),
    jailtime_check,
  ],
  harass: [
    ...shuffle([
      pledgeCheck,
      bribeCheck,
      targetPunchedCheck,
      admirer_check,
      prejudice_check,
      unlucky_check,
      recklessCheck,
    ]),
    jailtime_check,
  ],
  theft: [
    ...shuffle([
      pledgeCheck,
      bribeCheck,
      targetPunchedCheck,
      admirer_check,
      prejudice_check,
      unlucky_check,
      jailtime_check,
      recklessCheck,
    ]),
  ],
  pockets: [
    ...shuffle([bribeCheck, targetPunchedCheck, unlucky_check, jailtime_check]),
    ...shuffle([pledgeCheck, admirer_check, prejudice_check]),
  ],
  assault: [
    jailtime_check,
    ...shuffle([bribeCheck, targetPunchedCheck, unlucky_check]),
    ...shuffle([admirer_check, prejudice_check]),
    pledgeCheck,
  ],
}

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

export function addPledge(checked: QuestionProps) {
  checked.updateFromBehavior('cooldown',checked.cooldown + 8)
  // prettier-ignore
  // print('OUTCOMES:: PLEDGED::', target.name, 'pledged to be cool for::', target.cooldown)
}

export function pledgeCheck(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { skills: ls, binaries: lb } = chkr.traits
  const { skills: ts, binaries: tb } = chkd.traits

  const modifier = Math.round(
    lb.passiveAggressive * -5 + tb.passiveAggressive * 5
  )
  const advantage = ls.wisdom > ts.constitution + 2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -4, 3)
  // prettier-ignore
  // print('CHECKS:: PLEDGECHECK::', chkd.name, 'pledged to do good by', chkr.name, 'ROLL:', result)
  if (result > 5 && result <= 10) {
    addPledge(chkd)
    return { pass: true, type: 'pledge' }
  }

  if (result > 10) {
    // print('SPECIAL pledge')
    addPledge(chkd)
    addPledge(chkd)
    return { pass: true, type: 'pledgespecial' }
  }
  if (result <= 1) {
    // print('NEVER pledge')
    //add_prejudice(chkd.clan, chkr)
    return { pass: true, type: 'phonesecurity' }
  }

  return { pass: false, type: 'neutral' }
}

//Checks and Helpers
//effects
function addMasterCriminal(
  a: QuestionProps | ThiefVictimProps,
  c: QuestionProps | AttendantProps
) {
  const affected = a
  // if (chkd.name != 'player') {
  const cause = c
  const effects_list = ['inhiding', 'readup', 'eagleeye', 'rebel']
  const effect: Effect = fx[effects_list[math.random(0, 3)]]
  if (effect.fx.type == 'opinion') effect.fx.stat = cause.clan
  affected.addOrExtendEffect(effect)

  // print('OUTCOMES:: addchaoticgood::', t, 'inspired::', l, 'to be chaoticgood.')
}
function add_lawful_evil(chkr: QuestionProps, chkd: QuestionProps) {
  const listener = chkr
  if (chkd.name != 'player') {
    const target = chkd
    const effects_list = ['crimewave', 'devil', 'amped', 'ignorant']
    const effect: Effect = fx[effects_list[math.random(0, 3)]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    listener.addOrExtendEffect(effect)
  } else {
    listener.love = listener.love - 2
  }
  // print('OUTCOMES:: addchaoticgood::', t, 'inspired::', l, 'to be chaoticgood.')
}
function add_chaotic_good(chkr: QuestionProps, chkd: QuestionProps) {
  const listener = chkr
  if (chkd.name != 'player') {
    const target = chkd
    const effects_list = ['crimewave', 'inspired', 'eagleeye', 'modesty']
    const effect: Effect = fx[effects_list[math.random(0, 3)]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    listener.addOrExtendEffect(effect)
  } else {
    listener.love = listener.love - 2
  }
  // print('OUTCOMES:: addchaoticgood::', t, 'inspired::', l, 'to be chaoticgood.')
}
export function chaotic_good_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { skills: ls, binaries: lb } = chkr.traits
  const { binaries: tb } = chkd.traits
  const modifier = Math.round(ls.wisdom / 2 + lb.evil_good * 5)
  const advantage = tb.anti_authority > lb.anti_authority
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('CHECKS RESULT::: chaoticgood::', result)
  if (result > 5 && result <= 10) {
    add_chaotic_good(chkr, chkd)
    return { pass: true, type: 'chaoticgood' }
  }

  if (result > 10) {
    add_chaotic_good(chkr, chkd)

    // print('SPECIAL chaoticgood')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER chaoticgood')
    add_lawful_evil(chkr, chkd)

    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_dumb_crook(chkr: QuestionProps, chkd: QuestionProps) {
  // print('OUTCOMES:: addumbcrook::', t, 'inspired::', l, 'to be dumbcrook.')
  const listener = chkr
  if (chkd.name != 'player') {
    const target = chkd
    const effects_list = ['admirer', 'opportunist', 'inspired', 'amped']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    listener.addOrExtendEffect(effect)
  } else {
    listener.love = listener.love + 2
  }
}
export function dumb_crook_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { skills: ls, binaries: lb } = chkr.traits
  const { binaries: tb } = chkd.traits
  const modifier = Math.round(lb.lawlessLawful * -5)
  const advantage = tb.un_educated * -5 > ls.intelligence / 2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('CHECKS RESULT::: DUMBCROOK::', result)
  if (result > 5 && result <= 10) {
    add_dumb_crook(chkr, chkd)
    return { pass: true, type: 'dumbcrook' }
  }

  if (result > 10) {
    // print('SPECIAL dumbcrook')
    add_dumb_crook(chkr, chkd)

    return { pass: true, type: 'dumbcrookspecial' }
  }
  if (result <= 1) {
    print('NEVER dumbcrook')
    //might not work
    //might need to handle this in recklessseq
    //testjpf
    return { pass: true, type: 'phonesecurity' }
  }

  return { pass: false, type: 'neutral' }
}
function add_smartness(chkr: QuestionProps, chkd: QuestionProps) {
  // print('OUTCOMES:: ignorant::', t, 'inspired', l, 'to be ignorant')
  const listener = chkr
  if (chkd.name != 'player') {
    const effects_list = ['readup', 'eagleeye', 'yogi', 'crimewave']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = chkd.clan
    listener.addOrExtendEffect(effect)
  } else {
    listener.love = listener.love + 2
  }
}
function add_ignorant(chkr: QuestionProps, chkd: QuestionProps) {
  // print('OUTCOMES:: ignorant::', t, 'inspired', l, 'to be ignorant')
  const listener = chkr
  if (chkd.name != 'player') {
    const effects_list = ['prejudice', 'incharge', 'boring', 'loudmouth']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = chkd.clan
    listener.addOrExtendEffect(effect)
  } else {
    listener.love = listener.love + 2
  }
}
export function ignorant_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { skills: ls, binaries: lb } = chkr.traits
  const { skills: ts } = chkd.traits
  const modifier = Math.round(lb.un_educated * -5)
  const advantage = ts.intelligence > ls.perception
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)
  // print('CHECKS RESULT::: Ignorant::', result)
  if (result > 5 && result <= 10) {
    add_ignorant(chkr, chkd)
    return { pass: true, type: 'ignorant' }
  }
  if (result > 10) {
    // print('SPECIAL ignorant')
    add_ignorant(chkr, chkd)
    return { pass: true, type: 'ignorantspecial' }
  }
  if (result <= 1) {
    // print('NEVER ignorant')
    add_smartness(chkr, chkd)
    return { pass: true, type: 'ignorantcritical' }
  }

  return { pass: false, type: 'neutral' }
}

export function meritsDemerits(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { skills: ls, binaries: lb } = chkr.traits
  const { binaries: tb } = chkd.traits
  const modifier = Math.round((lb.evil_good + lb.lawlessLawful) * -2.5)
  const advantage =
    ls.constitution + (lb.passiveAggressive - tb.evil_good) * 5 > 7.5
  const result = rollSpecialDice(6, advantage, 3, 2) + clamp(modifier, -1, 1)
  // print('CHECKS RESULT:::', l, 'decides MERITS OR DEMERITS for::', t, result)

  if (result < 4) {
    return { pass: true, type: 'demerits' }
  }

  if (result > 8) {
    return { pass: true, type: 'merits' }
  }

  return { pass: false, type: 'neutral' }
}
export function recklessCheck(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { skills: ls, binaries: lb } = chkr.traits
  const { binaries: tb, skills: ts } = chkd.traits

  const watcherXp = clamp(Math.round(ls.wisdom + lb.lawlessLawful * 10), 4, 12)
  const targetXp = clamp(
    Math.round(ts.stealth + tb.mystical_logical * -10),
    4,
    12
  )
  const advantage = Math.abs(tb.passiveAggressive) * 5 > lb.evil_good * 10
  const tr = rollSpecialDice(targetXp, advantage)
  const wr = roll_dice(watcherXp)

  const reckless = tr > wr

  //prettier-ignore
  print('RECKLESSCHECKS RESULT:::', chkd.name, "targetdX:",targetXp, tr,'made,',chkr.name, 'dx:', watcherXp,wr,'RECKLESS:?',reckless)

  if (tr > 11) {
    // print('SPECIAL reckless')
    add_chaotic_good(chkr, chkd)
    return { pass: true, type: 'reckless' }
  }
  if (tr < 2) {
    // print('NEVER reckless')
    add_classy(chkr, chkd)
    return { pass: true, type: 'recklesscritical' }
  }

  return reckless === true
    ? { pass: true, type: 'reckless' }
    : { pass: false, type: 'neutral' }
}
function add_predator(chkr: QuestionProps, chkd: QuestionProps) {
  const listener = chkr
  // print('OUTCOMES:: Predator::', t, 'inspired', l, 'to be PREdATOR')

  if (chkd.name != 'player') {
    const target = chkd
    const effects_list = ['inspired', 'opportunist', 'vanity', 'inhiding']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = target.clan
    listener.addOrExtendEffect(effect)
  } else {
    listener.love = listener.love + 2
  }
}
export function predator_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { binaries: lb } = chkr.traits
  const { binaries: tb } = chkd.traits
  const modifier = Math.round(lb.evil_good * -5)
  const advantage = tb.anti_authority > lb.passiveAggressive
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('CHECKS RESULT::: ', t, 'made', l, 'PREDATOR::??', result)
  if (result > 5 && result <= 10) {
    add_predator(chkr, chkd)
    return { pass: true, type: 'predator' }
  }

  if (result > 10) {
    // print('SPECIAL predator')
    add_predator(chkr, chkd)
    add_admirer(chkd.clan, chkr)
    return { pass: true, type: 'predatorspecial' }
  }
  if (result <= 1) {
    // print('NEVER predator')
    return { pass: true, type: 'phonesecurity' }
  }

  return { pass: false, type: 'neutral' }
}
function add_classy(chkr: QuestionProps, chkd: QuestionProps): void {
  const listener = chkr
  // print('OUTCOMES:: classy::', t, 'inspired', l, 'to be classy')

  if (chkd.name != 'player') {
    const target = chkd
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
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { binaries: lb, skills: ls } = chkr.traits
  const { skills: ts } = chkd.traits
  const modifier = Math.round(lb.un_educated * 5)
  const advantage = ls.perception > ts.strength
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  if (result > 5 && result <= 10) {
    add_classy(chkr, chkd)
    return { pass: true, type: 'classy' }
  }

  if (result > 10) {
    // print('SPECIAL classy')
    add_classy(chkr, chkd)
    add_smartness(chkr, chkd)
    return { pass: true, type: 'classyspecial' }
  }
  if (result <= 1) {
    // print('NEVER classy')
    add_ignorant(chkr, chkd)
    return { pass: true, type: 'classycritical' }
  }

  return { pass: false, type: 'neutral' }
}
export function jailtime_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { binaries: lb, skills: ls } = chkr.traits
  const { skills: ts, binaries: tb } = chkd.traits

  const modifier = Math.round(
    ls.perception - ts.perception + lb.anti_authority * 4
  )
  const advantage = tb.passiveAggressive < 0.2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -4, 2)

  if (result > 5 && result <= 10) {
    return { pass: true, type: 'jailed' }
  }

  if (result > 10) {
    print(
      'need CRitical ArrestSequence for:',
      chkd.name,
      'ENFORCER:::',
      chkr.name
    )

    lConfrontPunchT(chkd, 1)
    print('SPECIAL jailed', chkd.name)
    return { pass: true, type: 'jailed' }
  }
  if (result <= 1) {
    tConfrontPunchL(chkr, 1)
    return { pass: true, type: 'jailedcritical' }
  }

  return { pass: false, type: 'neutral' }
}
export function lConfrontPunchT(
  chkd: QuestionProps,
  //l: string,
  hit = 1
) {
  //const target = this.p.world.returnNpc(t)
  chkd.updateFromBehavior('hp', chkd.hp - hit)
  // chkd.hp = chkd.hp - hit
  print('OUTCOMES:: PUNCH::', chkd.name, 'HITFOR::', hit, 'hp:', chkd.hp)
}

export function getExtorted(
  chkr: QuestionProps,
  chkd: QuestionProps
): string | null {
  // print('OUTCOMES:: ', t, 'GETSEXTORTED')
  return removeOfValue(chkr.inventory, chkd.inventory)
}

export function bribeCheck(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { binaries: lb, skills: ls } = chkr.traits
  const { binaries: tb, skills: ts } = chkd.traits

  const modifier = Math.round(
    lb.lawlessLawful * -3 + (ls.strength - ts.strength / 2)
  )
  const advantage = tb.evil_good < lb.evil_good - 0.3
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  // print('CHECKS:: BRIBECHECK::', t, 'asked for bribe by', l, 'ROLL:', result)
  if (result > 5 && result <= 10) {
    if (getExtorted(chkd, chkr) == null) lConfrontPunchT(chkd)
    return { pass: true, type: 'wPunchribe' }
  }

  if (result > 10) {
    // print('SPECIAL bribe')
    getExtorted(chkd, chkr)
    lConfrontPunchT(chkd, 2)
    return { pass: true, type: 'wPunchribespecial' }
  }
  if (result <= 1) {
    given_gift(chkd, chkr)
    return { pass: true, type: 'bribecritical' }
  }

  return { pass: false, type: 'neutral' }
}

export function tConfrontPunchL(chkr: QuestionProps, hit = 1) {
  // chkr.hp = chkr.hp - hit
  chkr.updateFromBehavior('hp', chkr.hp - hit)
  print('OUTCOMES:: TcL::', chkr.name, 'HITFOR::', hit, 'chkrhp', chkr.hp)
}
export function targetPunchedCheck(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const { binaries: lb, skills: ls } = chkr.traits
  const { binaries: tb, skills: ts } = chkd.traits

  const modifier = Math.round(
    (ls.constitution - ts.speed) / 2 + lb.evil_good * -2
  )
  const advantage = tb.passiveAggressive < lb.passiveAggressive - 0.3
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  // prettier-ignore
  // print('CHECKS:: TPUCNHLCHK::', t, '(unless crit)punched by', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
   lConfrontPunchT(chkd, 1)
    return { pass: true, type: 'wPunchS' }
  }

  if (result > 10) {
    // print('SPECIAL wPunchS')
    lConfrontPunchT(chkd, 3)
    return { pass: true, type: 'wPunchSspecial' }
  }
  if (result <= 1) {
    // print('NEVER wPunchS')
    tConfrontPunchL(chkr, 2)
    return { pass: true, type: 'sPunchScritical' }
  }

  return { pass: false, type: 'neutral' }
}
// Misc. Checks
export function suspicious_check(
  chkr: QuestionProps | AttendantProps,
  chkd: QuestionProps | ThiefVictimProps
): Consequence {
  const target = chkd
  const listener = chkr
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

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
    print('SPECIAL suspicious')
    //  go_to_jail(suspect)
    return chkr.clan == 'security'
      ? { pass: true, type: 'jailed' }
      : { pass: true, type: 'phonesecurity' }
  }
  if (result <= 1) {
    // print('NEVER suspicious')
    //shuffle(pos_consolations)[0](suspect)
    add_admirer(chkd.clan, chkr as QuestionProps)
    return { pass: true, type: 'suspiciouscritical' }
  }

  return { pass: false, type: 'neutral' }
}

export function seen_check(
  t: ThiefVictimProps,
  watcher: AttendantProps
): { confront: boolean; type: string } {
  const target = t
  const { binaries: wb, skills: ws } = watcher.traits
  const { skills: ts, binaries: tb } = target.traits
  // const heat = 'heat' in target ? target.heat * 10 : wb.poor_wealthy * -4

  const watcherXp: number = clamp(
    Math.round((ws.speed + ws.constitution) / 1.5 + wb.passiveAggressive * 7.5),
    4,
    12
  )
  const targetXp: number = clamp(
    Math.round(
      ts.stealth + tb.lawlessLawful * -7.5 - crimeSeverity[target.crime]
    ),
    4,
    12
  )

  const advantage =
    ts.speed - wb.lawlessLawful * 10 > ws.stealth + ws.perception

  const result = rollSpecialDice(targetXp, advantage)
  const wres = roll_dice(watcherXp)
  const seen = result <= wres

  //prettier-ignore
  print(target.name,'|perpDX:',targetXp,watcher.name,'|WatcherDX:',watcherXp,'adv:',advantage,'pRESULT:',result,'wResult',wres,seen)
  //prettier-ignore
  print('SEENCHECK PROBABILITY:::',ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`],'w/ advantage:::',advantage === true  ? ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`] + ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`] / 2  : ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`] / 2)
  if (result > 11) {
    addMasterCriminal(t, watcher)
    return { confront: false, type: 'seenspecial' }
  }
  if (result < 2) return { confront: true, type: 'seen' }
  //const bossResult = rollSpecialDice(7, true, 3, 2)
  //const seen = result <= bossResult
  return seen === true
    ? { confront: false, type: 'seen' }
    : { confront: false, type: 'neutral' }
}
export function take_check(
  taker: ThiefVictimProps,
  actor: ThiefVictimProps | Storage
) {
  const { skills, binaries } = taker.traits
  const modifier = Math.round(
    skills.stealth - skills.charisma + binaries.passiveAggressive * -5
  )
  const advantage = binaries.poor_wealthy + binaries.anti_authority * -1 > 0
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)
  if (result < 5) return false

  let chest_item = null
  if (math.random() < 0.5) {
    chest_item = removeValuable(actor.inventory)
  } else if (math.random() < 0.51) {
    chest_item = removeAdvantageous(actor.inventory, skills)
  } else {
    chest_item = actor.inventory[math.random(0, actor.inventory.length)]
  }
  //prettier-ignore
  print('CHKFUNCS::: TAKECHECK::', chest_item,'stolenFrom:',actor.name,'by',taker.name)
  if (chest_item !== null) {
    taker.updateInventory('add', chest_item)
    actor.updateInventory('delete', chest_item)
    // taker.addInvBonus(chest_item)
  }
}

export function stash_check(
  stasher: ThiefVictimProps,
  actor: ThiefVictimProps | Storage
) {
  const modifier = stasher.inventory.length - actor.inventory.length
  const advantage = actor.inventory.length < 2 || stasher.inventory.length > 5
  const result = rollSpecialDice(5, advantage, 3, 2) + modifier
  if (result < 5) return false

  let chest_item: string | null = null
  if (math.random() < 0.5) {
    chest_item = removeValuable(stasher.inventory)
  } else if (math.random() < 0.51) {
    chest_item = removeAdvantageous(stasher.inventory, stasher.traits.skills)
  } else {
    chest_item = stasher.inventory[stasher.inventory.length - 1]
  }

  //prettier-ignore
  print('CHKFUNCS::: stashCHECK::', chest_item,'stolenFrom:',actor.name,'by',stasher.name)

  if (chest_item !== null) {
    stasher.updateInventory('delete', chest_item)
    actor.updateInventory('add', chest_item)
  }
  // if victim == true ){ add_chest_bonus(n, chest_item) }
}
export function take_or_stash(
  attendant: ThiefVictimProps,
  actor: ThiefVictimProps | Storage
) {
  if (
    actor.inventory.length > 0 &&
    (attendant.inventory.length == 0 || math.random() < 0.5)
  ) {
    take_check(attendant, actor)
  } else if (attendant.inventory.length > 0) {
    stash_check(attendant, actor)
  }
}
export function witnessPlayer(
  player: ThiefVictimProps,
  watcher: AttendantProps
  //storage?: Storage
): Consequence {
  const consequence =
    seen_check(player, watcher).type == 'seen'
      ? {
          pass: true,
          type: 'seen',
        } //suspicious_check(watcher, player)
      : {
          pass: false,
          type: 'neutral',
        }
  print('witness_player::: consequence:', consequence.pass, consequence.type)

  return consequence
}
// only being used between npcs (just tutorial luggage)
//this.npcs.checks.stealCheck
export function npcStealCheck(
  // this: WorldTasks,
  target: ThiefVictimProps,
  watcher: AttendantProps,
  storage?: Storage
): null | string {
  // prettier-ignore
  // print('npcSTEALchkLOOT:::', target.name, target.currRoom, watcher.name, watcher.currRoom, loot[0])

  const { binaries: wb, opinion: wo } = watcher.traits
  const { skills: ts, binaries: tb, opinion: to } = target.traits

  /**
   * testjpf
   * use this to test legit dice roll
   * so watcher needs an xp to exceed
   * clamp good + lawful x 10  4,12       
   * - clan opinion     /2
   * target
   * speed+ stealth/2
   *  - crimeseverity - clan
   * advantage?::: 
   * target lawfulness - wealthy < 0!!!
  
  //if (target.cooldown > 0) return

  const modifier = Math.round(
    ts.speed + //target is fast and stealthy 
      ts.stealth -
      target.cooldown + // has commited crime recetly
      wo[target.clan] - // if they like hate 
      to[watcher.clan] * 3 //if they like hate x 3
  )
       */
  const watcherXp = clamp(
    Math.round((wb.evil_good + wb.lawlessLawful) * 7.5 - wo[target.clan]),
    4,
    12
  )
  const targetXp = clamp(
    Math.round(
      (ts.speed + ts.stealth) / 1.5 -
        to[watcher.clan] -
        crimeSeverity[target.crime]
    ),
    4,
    12
  )
  const advantage = tb.lawlessLawful - tb.poor_wealthy < 0
  const tr = rollSpecialDice(targetXp, advantage)
  const wr = roll_dice(watcherXp)

  const result = tr > wr

  //prettier-ignore
  print(target.name,'|PerpDX:',targetXp,tr,watcher.name,'|WatcherDX:',watcherXp,wr,':: advantage:',advantage,'RESULT:',result)
  //prettier-ignore
  print('StealCHECK PROBABILITY::',ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`],'w/ Advantage:::',advantage === true  ? ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`] +  ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`] / 2  : ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`] / 2)

  if (result === false) return 'failed'
  const consequence = seen_check(target, watcher)
  if (consequence.type == 'seen') {
    return 'witness'
  }
  const actor = storage === undefined ? watcher : storage
  if (consequence.type == 'neutral') {
    let chest_item = null
    if (math.random() < 0.4) {
      chest_item = actor.inventory[math.random(0, actor.inventory.length - 1)]
    } else if (math.random() < 0.5) {
      chest_item = removeValuable(actor.inventory)
    } else {
      chest_item = removeAdvantageous(actor.inventory, ts)
    }

    if (chest_item !== null) {
      target.updateInventory('add', chest_item)
      actor.updateInventory('delete', chest_item)
    }
    target.cooldown = math.random(5, 15)
  }

  target.cooldown = target.cooldown + 5
  return null
}

export function npcAssaultCheck(
  // this: WorldTasks,
  target: ThiefVictimProps,
  watcher: AttendantProps
): null | string {
  // prettier-ignore
  // print('npcSTEALchkLOOT:::', target.name, target.currRoom, watcher.name, watcher.currRoom, loot[0])
  const consequence = seen_check(target, watcher)
  if (consequence.type !== 'seen') return 'failed'

  const { binaries: wb, opinion: wo } = watcher.traits
  const { skills: ts, binaries: tb, opinion: to } = target.traits

  const watcherXp = clamp(
    Math.round((wb.evil_good + wb.lawlessLawful) * 7.5 - wo[target.clan]),
    4,
    12
  )
  const targetXp = clamp(
    Math.round(
      (ts.speed + ts.stealth) / 1.5 -
        to[watcher.clan] -
        crimeSeverity['assault']
    ),
    4,
    12
  )
  const advantage = tb.lawlessLawful - tb.poor_wealthy < 0
  const tr = rollSpecialDice(targetXp, advantage)
  const wr = roll_dice(watcherXp)

  const result = tr > wr

  //prettier-ignore
  print(target.name,'|PerpDX:',targetXp,tr,watcher.name,'|WatcherDX:',watcherXp,wr,':: advantage:',advantage,'RESULT:',result)
  //prettier-ignore
  print('AssaultHECK PROBABILITY::',ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`],'w/ Advantage:::',advantage === true  ? ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`] +  ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`] / 2  : ROLLODDS[`${tostring(targetXp)}${tostring(watcherXp)}`] / 2)

  if (result === true) return 'neutral'
  /**
   * if below '5' do nothing above '10' confront
   * other = suspecting?
   * critical 1 == ??? add cowardiceor somethin
   */

  if (tr < 2) {
    // print('NEVER angel')
    //add_cowardice
    return 'assaultcritfail'
  }

  return 'assault'
}
function add_angel(add: (effect: Effect) => void): void {
  const effect: Effect = { ...fx.angel }
  add(effect)
}
export function angel_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const target = chkd
  const listener = chkr
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const modifier = Math.round(ts.wisdom - ls.wisdom)
  const advantage = Math.abs(tb.evil_good) > Math.abs(lb.evil_good)
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  // prettier-ignore
  // print('CHECKS:: ANCGELCHK::', t, 'is thought of as an angel by?', l, 'ROLL:', result)
  if (result > 5 && result <= 10) {
    add_angel(listener.addOrExtendEffect.bind(listener))
    return { pass: true, type: 'angel' }
  }

  if (result > 10) {
    // print('SPECIAL angel')
    return { pass: true, type: 'angelspecial' }
  }
  if (result <= 1) {
    // print('NEVER angel')
    return { pass: true, type: 'angelcritical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_vanity(add: (effect: Effect) => void): void {
  // print('CCOUTCOME:: vanity has overtaken', listener)
  const effect: Effect = { ...fx.vanity }
  add(effect)
}
export function vanity_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const target = chkd
  const listener = chkr
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const watcherXp = clamp(
    Math.round(ls.intelligence + lb.un_educated * -10 + ls.wisdom),
    4,
    12
  )
  const targetXp = clamp(
    Math.round(ts.charisma + tb.un_educated * 10 + ts.strength),
    4,
    12
  )
  const advantage = lb.evil_good < tb.evil_good
  const result = rollSpecialDice(targetXp, advantage)
  const vain = result > roll_dice(watcherXp)

  // print('CHECKS:: ANCGELCHK::', t, 'has made vane::', l, 'ROLL:', result)

  if (result > 11) {
    // print('SPECIAL VANITY')
    add_vanity(listener.addOrExtendEffect.bind(listener))
    return { pass: true, type: 'vanityspecial' }
  }
  if (result < 2) {
    // print('NEVER VANITY')
    add_angel(listener.addOrExtendEffect.bind(listener))
    return { pass: true, type: 'vanitycritical' }
  }
  add_vanity(listener.addOrExtendEffect.bind(listener))

  return vain === true
    ? { pass: true, type: 'vanity' }
    : { pass: false, type: 'neutral' }
}
function add_admirer(tClan: string, listener: QuestionProps) {
  // print('OUTCOMESADMIRE::', listener.name, 'has admiration for:', tClan)
  if (tClan === 'player') {
    listener.love++
    return
  }
  const effect: Effect = { ...fx.admirer }
  effect.fx.stat = tClan
  listener.addOrExtendEffect(effect)
}
export function admirer_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const target = chkd
  const listener = chkr
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts } = target.traits
  const modifier = Math.round(
    ts.charisma - ls.charisma + lb.anti_authority * -5
  )
  const advantage = ts.intelligence > ls.perception && ls.strength < 5
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  // print('CHECKS:: ADMIRERCHK::', t, 'is admired by::', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
    add_admirer(target.name == 'player' ? target.name : target.clan, listener)
    return { pass: true, type: 'admirer' }
  }

  if (result > 10) {
    // print('SPECIAL ADMIRERER')
    return { pass: true, type: 'admirerspecial' }
  }
  if (result <= 1) {
    // print('NEVER ADMIRERER')
    return { pass: true, type: 'admirercritical' }
  }

  return { pass: false, type: 'neutral' }
}
export function add_prejudice(tClan: string, listener: QuestionProps) {
  // print('OUTCOME:: is prejudiced', listener)
  if (tClan === 'hero') {
    listener.love--
    return
  }
  const effect: Effect = { ...fx.prejudice }
  effect.fx.stat = tClan
  listener.addOrExtendEffect(effect)
}
export function prejudice_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const target = chkd
  const listener = chkr
  const { skills: ls, binaries: lb } = listener.traits
  const { binaries: tb } = target.traits

  const modifier = Math.round(lb.poor_wealthy * -5 + tb.poor_wealthy * -5)
  const advantage = ls.wisdom + ls.charisma < ls.stealth / 2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  // print('CHECKS:: PREJUDICECHK::', t, 'is hated by::', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
    add_prejudice(target.name == 'player' ? target.name : target.clan, listener)
    return { pass: true, type: 'prejudice' }
  }

  if (result > 10) {
    // print('SPECIAL prejudice')
    add_prejudice(target.name == 'player' ? target.name : target.clan, listener)
    return { pass: true, type: 'prejudicespecial' }
  }
  if (result <= 1) {
    // print('NEVER prejudice')
    add_admirer(chkd.clan, chkr)
    return { pass: true, type: 'prejudicecritical' }
  }

  return { pass: false, type: 'neutral' }
}

export function watcher_punched_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const target = chkd
  const listener = chkr
  const { skills: ls } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const modifier = Math.round(
    tb.lawlessLawful * -5 + ts.strength - ls.strength - ls.wisdom
  )
  const advantage = tb.passiveAggressive * 7 > ls.speed
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  // print('CHECKS:: Listenerpunched::', t, 'hits::', l, 'ROLL:', result)

  if (result > 5 && result <= 10) {
    tConfrontPunchL(chkr, 1)
    return { pass: true, type: 'sPunchW' }
  }

  if (result > 10) {
    // print('SPECIAL sPunchW')
    tConfrontPunchL(chkr, 3)

    return { pass: true, type: 'sPunchWspecial' }
  }
  if (result <= 1) {
    // print('NEVER sPunchW')
    lConfrontPunchT(chkd, 2)
    return { pass: true, type: 'wPunchWcritical' }
  }

  return { pass: false, type: 'neutral' }
}
export function unlucky_check(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const modifier = math.random(-1, 1)
  const advantage = math.random() > 0.5
  const result = rollSpecialDice(5, advantage, 3, 2) + modifier
  if (result > 5 && result <= 10) {
    const random = math.random(0, 4)
    if (random == 0) {
      getExtorted(chkd, chkr)
    } else if (random == 1) {
      lConfrontPunchT(chkd)
      return { pass: true, type: 'wPunchnlucky' }
    } else if (random == 2) {
      addPledge(chkd)
    } else if (random == 3) {
      return chkr.clan == 'security'
        ? { pass: true, type: 'jailed' }
        : { pass: true, type: 'phonesecurity' }
    } else if (random == 4) {
      add_prejudice(chkd.name == 'player' ? chkd.name : chkd.clan, chkr)
    }
    return { pass: true, type: 'unlucky' }
  }

  if (result > 10) {
    return chkr.clan == 'security'
      ? { pass: true, type: 'jailed' }
      : { pass: true, type: 'phonesecurity' }
  }
  if (result <= 1) {
    shuffle([charmed_merits, ap_boost, given_gift, love_boost])[0](chkd, chkr)
    return { pass: true, type: 'unluckycritical' }
  }

  return { pass: false, type: 'neutral' }
}

export function becomeASnitchCheck(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const target = chkd
  const listener = chkr
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts, binaries: tb } = target.traits

  const advantage =
    ts.stealth + ts.charisma >
    ls.constitution + Math.abs(lb.passiveAggressive * 10)

  const watcherXp = clamp(
    Math.round(lb.anti_authority * 5 + Math.abs(lb.poor_wealthy * 10)),
    4,
    12
  )
  const targetXp = clamp(
    Math.round(tb.poor_wealthy * 5 + Math.abs(tb.passiveAggressive * 10)),
    4,
    12
  )
  const result = rollSpecialDice(targetXp, advantage)
  const snitch = result < roll_dice(watcherXp)
  //const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  //const bossResult = rollSpecialDice(7, true, 3, 2)
  //const seen = result <= bossResult

  if (result > 11) {
    return { pass: true, type: 'snitchspecial' }
  }
  if (result <= 1) {
    return { pass: true, type: 'snitch' }
  }

  return snitch === true
    ? { pass: false, type: 'snitch' }
    : { pass: false, type: 'neutral' }
}

export function love_boost(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const target = chkd
  const listener = chkr
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

  if (result > 10) return { pass: true, type: 'loveboostspecial' }
  return { pass: false, type: 'neutral' }
}
export function ap_boost(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const target = chkd
  const listener = chkr
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

  if (result > 10) return { pass: true, type: 'apboostspecial' }
  return { pass: false, type: 'neutral' }
}
export function charmed_merits(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  const target = chkd
  const listener = chkr
  const { skills: ls, binaries: lb } = listener.traits
  const { skills: ts } = target.traits

  const modifier = Math.round(
    (ts.charisma + listener.love) / 2 - ls.constitution
  )
  const advantage = ts.charisma > ls.charisma && lb.un_educated < -0.1
  const result =
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1)

  if (result > 5 && result <= 10) return { pass: true, type: 'merits' }

  if (result > 10) return { pass: true, type: 'charmedspecial' }

  return { pass: false, type: 'neutral' }
}
export function given_gift(
  chkr: QuestionProps,
  chkd: QuestionProps
): Consequence {
  //testjpf check if inventory full?!
  let gift = removeAdvantageous(chkr.inventory, chkd.traits.skills)

  if (gift == null) gift = math.random() < 0.5 ? 'berry02' : 'coingold'
  chkd.updateInventory('add', gift)
  //chkd.addInvBonus(gift)

  return { pass: true, type: 'gift' }
}
