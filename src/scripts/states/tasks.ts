/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Npc,
  WorldQuests,
  AllQuestsMethods,
  Skills,
  Caution,
} from '../../types/state'
import { tutorialQuests } from '../quests/tutorialstate'
import { shuffle } from '../utils/utils'
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
//const chest = require('../../main.systems.inventorysystem')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function snitch(bins: Skills, skills: Skills): Consolation {
  if (bins.anti_authority > -0.7) {
    //tell authority they have good attitude towards
    return { fail: true, caution: 'snitch' }
  }
  return { fail: false, caution: 'neutral' }
}
function reckless(bins: Skills, skills: Skills): Consolation {
  //testjpf was -.5 , 4
  if (bins.un_educated < -0.4 || skills.intelligence < 4) {
    //underdog task
    return { fail: true, caution: 'reckless' }
  }
  // will tell whoever what they saw
  // they might like it or hate it

  return { fail: false, caution: 'neutral' }
}
function merits(bins: Skills, skills: Skills): Consolation {
  if (bins.evil_good < -0.2 && bins.lawless_lawful < -0.2) {
    return { fail: true, caution: 'merits' }
  } else if (bins.passive_aggressive < -0.3 || skills.constitution < 4)
    return { fail: true, caution: 'demerits' }

  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { fail: false, caution: 'neutral' }
}
//should be build checkpoints?
function build_quests(questmethods: AllQuestsMethods): WorldQuests {
  return {
    tutorial: tutorialQuests(questmethods),
  }
}
interface Consolation {
  fail: boolean
  caution: string
}

export default class WorldTasks {
  private _cautions: Caution[]
  private questmethods: AllQuestsMethods
  private consolations: Array<(b: Skills, s: Skills) => Consolation>
  private quests: WorldQuests
  constructor(questmethods: AllQuestsMethods) {
    //testjpf may not need? pass directly to this.quests
    this.questmethods = questmethods
    this._cautions = []
    this.quests = build_quests(this.questmethods)
    this.consolations = [snitch, merits, reckless]
  }
  public get cautions() {
    return this._cautions
  }
  remove_heat(sus: string) {
    for (let i = this.cautions.length - 1; i >= 0; i--) {
      const c = this.cautions[i]
      if (
        c.suspect == sus &&
        (c.state == 'questioning' || c.state == 'arrest' || c.state == 'snitch')
      ) {
        this.cautions.splice(i, 1)
      }
    }
  }
  already_hunting(npc: string, sus: string) {
    for (const c of this.cautions) {
      if (
        c.npc == npc &&
        c.suspect == sus &&
        (c.state == 'questioning' || c.state == 'arrest')
      ) {
        return c
      }
    }
    return null
  }
  plan_on_snitching(npc: string, sus: string): boolean {
    for (const c of this.cautions) {
      if (c.npc == npc && c.suspect == sus && c.state == 'snitch') {
        return true
      }
    }
    return false
  }
  npc_has_caution(npc: string, sus: string): Caution | null {
    for (const c of this.cautions) {
      if ((npc == 'any' || c.npc == npc) && c.suspect == sus) {
        return c
      }
    }
    return null
  }
  caution_builder(n: Npc, c: string, s: string, r: string) {
    //explain why you need this testjpf
    //no nested ifs
    //cna this be done somewhere else?
    //testjpfm something like:
    // const reason = "theft"
    const append: Caution = {
      npc: n.labelname,
      time: 15,
      state: c, // merits //testjpf state is a bad name
      type: 'npc',
      authority: n.clan, //ex; labor
      suspect: s,
      reason: r.length > 0 ? r : 'theft',
    }
    //testjpf this is getting bad.  cleanup code
    if (c == 'snitch') {
      append.authority = 'security'
      append.type = 'clan'
      //testjpf no way this ever worked?!?!?
      //c.suspect cant be reached?? or defined?
      //changed to just "s"
      if (s == 'player') {
        this.questmethods.pq.increase_alert_level()
      }
    } else if (c == 'merits') {
      if (s == 'player') {
        n.love = n.love + 1
      }
      append.time = 3
    } else if (c == 'demerits') {
      if (s == 'player') {
        n.love = n.love - 1
      }
      append.time = 3
    } else if (c == 'reckless') {
      append.time = 3
    }

    print(
      append.npc,
      'know that',
      append.suspect,
      'did',
      append.reason,
      'so created caution:',
      append.state
    )

    this.append_caution(append)
  }
  append_caution(caution: Caution) {
    this.cautions.push(caution)
  }
  //TESTJPF ABOVE: all manipulate or return cautions
  //below do consolations need to be part of state at all??
  //probably not MOVE TO new "consequences" . "util"?
  consolation_checks(b: Skills, s: Skills) {
    const tempcons: Array<(b: Skills, s: Skills) => Consolation> = shuffle(
      this.consolations
    )
    tempcons.forEach((c) => {
      const consolation = c(b, s)
      if (consolation.fail == true) return consolation.caution
    })
    print('did nothing after witnessing a theft attempt')
    return 'neutral'
  }
}
