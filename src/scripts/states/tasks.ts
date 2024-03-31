/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Npc,
  WorldQuests,
  AllQuestsMethods,
  Skills,
  Caution,
} from '../../types/state'
import { shuffle } from '../utils/utils'
import { tutorialQuests } from './inits/quests/tutorialstate'
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires

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
  private _questmethods: AllQuestsMethods
  private consolations: Array<(b: Skills, s: Skills) => Consolation>
  private _quests: WorldQuests
  //spawn will be updated when checkpoints are passed
  private _spawn: string
  medicQueue: string[]

  constructor(questmethods: AllQuestsMethods) {
    this._questmethods = questmethods
    this._cautions = []
    this._quests = build_quests(this.questmethods)
    this.consolations = [snitch, merits, reckless]
    this._spawn = 'grounds'
    this.medicQueue = []
  }
  public set spawn(s: string) {
    this._spawn = s
  }
  public get spawn() {
    return this._spawn
  }
  public set quests(s: WorldQuests) {
    this._quests = s
  }
  public get quests() {
    return this._quests
  }
  public get cautions() {
    return this._cautions
  }
  public get questmethods() {
    return this._questmethods
  }
  remove_heat(sus: string) {
    for (let i = this.cautions.length - 1; i >= 0; i--) {
      const c = this.cautions[i]
      if (
        c.suspect == sus &&
        (c.label == 'questioning' ||
          c.label == 'arrest' ||
          c.label == 'snitch' ||
          c.label == 'injury')
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
        (c.label == 'questioning' || c.label == 'arrest')
      ) {
        return c
      }
    }
    return null
  }
  plan_on_snitching(npc: string, sus: string): boolean {
    for (const c of this.cautions) {
      if (c.npc == npc && c.suspect == sus && c.label == 'snitch') {
        return true
      }
    }
    return false
  }
  busy_doctors(): string[] {
    const docs = this.cautions
      .filter((c) => c.label == 'mending')
      .map((c) => c.npc)

    print('busy_doc:: docs[0]:', docs[0])
    return docs
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
      label: c, // merits //testjpf state is a bad name
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
    } else if (c == 'injury') {
      append.authority = 'doctors'
      append.type = 'clan'
    }

    print(
      append.npc,
      'know that',
      append.suspect,
      'did',
      append.reason,
      'so created caution:',
      append.label
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
  // checks quest completion after interactions and turns
  address_quests = (interval: string, checkpoint: string) => {
    //  print('checkpoint.slice(0, -1)', checkpoint.slice(0, -1))
    const quests = this.quests[checkpoint.slice(0, -1)]

    let questKey: keyof typeof quests
    for (questKey in quests) {
      const quest = quests[questKey]
      if (quest.passed == false) {
        let quest_passed = true
        // print('questKey:', questKey)
        let condition: keyof typeof quest.conditions
        for (condition in quest.conditions) {
          //   print('condition:', condition)
          const goal = quest.conditions[condition]
          //    print('goal label', goal.label, goal.passed, goal.interval, interval)
          if (goal.passed == false && goal.interval == interval) {
            for (let i = goal.func.length; i-- !== 0; ) {
              if (goal.func[i]!(goal.args[i]) == true) {
                goal.passed = true
                //         print('quest Condition passed::', goal.label)
                break
              }
            }
          }
          if (goal.passed == false) quest_passed = false
        }
        if (quest_passed == true) {
          quest.passed = true
          print(questKey, 'quest COMPLETE!!!')
        }
      }
    }
  }
}
