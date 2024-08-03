import { Npc } from '../../types/state'
import { AllQuestsMethods, WorldQuests, Caution } from '../../types/tasks'
import { tutorialQuests } from './inits/quests/tutorialstate'

function build_quests_state(questmethods: AllQuestsMethods): WorldQuests {
  return {
    tutorial: tutorialQuests(questmethods),
  }
}
export default class WorldTasks {
  private _cautions: Caution[]
  private _questmethods: AllQuestsMethods
  //private consolations: Array<(b: Skills, s: Skills) => Consolation>
  private _quests: WorldQuests
  //spawn will be updated when checkpoints are passed.
  private _spawn: string
  mendingQueue: string[]

  constructor(questmethods: AllQuestsMethods) {
    this._questmethods = questmethods
    this._questmethods.tq = {
      num_of_injuries: this.num_of_injuries.bind(this),
      percent_tutorial: this.percent_tutorial.bind(this),
    }
    this._cautions = []
    this._quests = build_quests_state(this.questmethods)
    this._spawn = 'grounds'
    this.mendingQueue = []
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
  caution_has_npc(reason: string): string | null {
    for (let i = this.cautions.length - 1; i >= 0; i--) {
      const c = this.cautions[i]
      if (c.reason == reason) {
        return this.cautions[i].npc
      }
    }
    return null
  }
  percent_tutorial(): number {
    let qKey: keyof typeof this.quests
    let count = 0
    let passed = 0
    for (qKey in this.quests['tutorial']) {
      if (this.quests['tutorial'][qKey].passed == true) passed = passed + 1
      count = count + 1
    }

    return Math.round((passed / count) * 100)
  }
  num_of_injuries(): number {
    const injuries = this.cautions.filter((c) => c.label == 'injury').length
    //print('busy_doc:: docs[0]:', docs[0])
    return injuries
  }
  remove_quest_cautions(npc: string) {
    for (let i = this.cautions.length - 1; i >= 0; i--) {
      const c = this.cautions[i]
      if (c.suspect == npc && ['quest'].includes(c.label)) {
        this.cautions.splice(i, 1)
      }
    }
  }
  remove_mend(sus: string) {
    for (let i = this.cautions.length - 1; i >= 0; i--) {
      const c = this.cautions[i]
      if (c.suspect == sus && ['mending'].includes(c.label)) {
        this.cautions.splice(i, 1)
      }
    }
  }
  remove_heat(sus: string) {
    for (let i = this.cautions.length - 1; i >= 0; i--) {
      const c = this.cautions[i]
      if (
        c.suspect == sus &&
        ['questioning', 'arrest', 'snitch', 'injury'].includes(c.label)
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
  npc_has_caution(npc: string, sus: string): Caution | null {
    for (const c of this.cautions) {
      if ((npc == 'any' || c.npc == npc) && c.suspect == sus) {
        return c
      }
    }
    return null
  }
  has_clearance(sus: string): boolean {
    for (const c of this.cautions) {
      if (c.suspect == sus && c.label == 'clearance') {
        return true
      }
    }
    return false
  }
  npc_is_wanted(sus: string): boolean {
    for (const c of this.cautions) {
      if (
        c.suspect == sus &&
        (c.label == 'arrest' || c.label == 'questioning')
      ) {
        return true
      }
    }
    return false
  }
  number_of_cautions(sus: string): number {
    let count = 0
    for (const c of this.cautions) {
      if (c.suspect == sus) {
        count++
      }
    }
    return count
  }
  caution_builder(n: Npc, c: string, s: string, reason = 'theft') {
    //explain why you need this testjpf
    //no nested ifs
    //cna this be done somewhere else?
    const append: Caution = {
      npc: n.labelname,
      time: 15,
      label: c, // merits //testjpf state is a bad name
      type: 'npc',
      authority: n.clan, //ex; labor
      suspect: s,
      reason,
    }
    //testjpf this is getting bad.  cleanup code
    if (c == 'snitch') {
      append.authority = 'security'
      append.type = 'clan'
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
      append.time = 30
    } else if (c == 'suspicious') {
      append.label = 'snitch'
      append.authority = 'security'
      append.type = 'clan'
      append.time = 10
      append.reason = 'suspicious'
    }

    print(
      append.npc,
      'know that',
      append.suspect,
      'did',
      append.reason,
      'so created caution:',
      append.label,
      'for time:',
      append.time
    )

    this.append_caution(append)
  }
  append_caution(caution: Caution) {
    print('NEW::: Appended caution::', caution.label, caution.npc)
    this.cautions.push(caution)
  }
  // checks quest completion after interactions and turns
  update_quests_state = (interval: string, checkpoint: string) => {
    //  print('checkpoint.slice(0, -1)', checkpoint.slice(0, -1))
    const quests = this.quests[checkpoint.slice(0, -1)]

    let questKey: keyof typeof quests
    for (questKey in quests) {
      const quest = quests[questKey]
      if (quest.passed == false) {
        let quest_passed = true
        //print('questKey:', questKey)
        let condition: keyof typeof quest.conditions
        for (condition in quest.conditions) {
          // print('condition:', condition)
          const goal = quest.conditions[condition]
          //print('PREgoal label:', goal.label, goal.passed, goal.status)
          if (goal.passed == false || goal.status == 'standby') {
            for (let i: number = goal.func.length; i-- !== 0; ) {
              if (
                goal.interval[i] == interval &&
                goal.func[i]!(goal.args[i]) == true
              ) {
                print('goal PASSED: GOAL', goal.label)
                goal.passed = true
                goal.status = 'complete'
                quest.status = 'active'
                break
              }
            }
          }
          //print('POSTgoal label:', goal.label, goal.passed, goal.status)

          if (goal.passed == false) quest_passed = false
        }
        if (quest_passed == true) {
          quest.passed = true
          quest.status = 'complete'
          print(questKey, 'quest COMPLETE!!!')
        }
      }
    }
  }
  get_field_docs(): string[] {
    //if mending and in field busy
    //if mending in office and office full
    const docs = this.cautions
      .filter((c) => c.reason == 'field')
      .map((c) => c.npc)

    return docs
  }
  has_ignore_caution(n: string): boolean {
    //if mending and in field busy
    //if mending in office and office full
    const ignored = this._cautions.filter(
      (c) => c.label == 'ignore' && c.npc == n
    )
    print(
      'ignored.length > 0 ? true : false',
      ignored.length > 0 ? true : false
    )
    return ignored.length > 0 ? true : false
  }
}
