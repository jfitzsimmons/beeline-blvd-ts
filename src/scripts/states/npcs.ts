import { NpcsInitState } from './inits/npcsInitState'
import { Npc, Npcs } from '../../types/state'
import { shuffle } from '../utils/utils'
import { QuestMethods } from '../../types/tasks'
interface BinaryLookupTable {
  [key: string]: BinaryLookupRow
}
interface BinaryLookupRow {
  [key: string]: number
}
const skills = {
  constitution: 5,
  charisma: 5, // deception?
  wisdom: 5,
  intelligence: 5,
  speed: 5,
  perception: 5, // insight
  strength: 5, //carrying capacity, intimidation
  stealth: 5, // !!
}
const binaries = {
  evil_good: 0,
  passive_aggressive: 0,
  lawless_lawful: 0,
  anti_authority: 0,
  un_educated: 0,
  poor_wealthy: 0,
}
const binarylookup: BinaryLookupTable = {
  ais: {
    evil_good: 0.3,
    passive_aggressive: -0.3,
    lawless_lawful: 0.2,
    anti_authority: -0.2,
    un_educated: 0,
    poor_wealthy: -0.1,
  },
  church: {
    evil_good: 0,
    passive_aggressive: -0.1,
    lawless_lawful: 0.1,
    anti_authority: 0.2,
    un_educated: -0.3,
    poor_wealthy: 0.1,
  },
  contractors: {
    evil_good: 0.1,
    passive_aggressive: -0.1,
    lawless_lawful: 0.1,
    anti_authority: 0.1,
    un_educated: 0.3,
    poor_wealthy: 0.2,
  },
  corps: {
    evil_good: -0.3,
    passive_aggressive: 0.1,
    lawless_lawful: 0,
    anti_authority: -0.1,
    un_educated: 0.2,
    poor_wealthy: 0.3,
  },
  gang1: {
    evil_good: -0.2,
    passive_aggressive: 0.3,
    lawless_lawful: -0.2,
    anti_authority: 0.1,
    un_educated: -0.2,
    poor_wealthy: -0.1,
  },
  gang2: {
    evil_good: -0.2,
    passive_aggressive: 0,
    lawless_lawful: -0.1,
    anti_authority: -0.1,
    un_educated: -0.2,
    poor_wealthy: 0.2,
  },
  gang3: {
    evil_good: -0.1,
    passive_aggressive: 0.2,
    lawless_lawful: -0.3,
    anti_authority: 0.2,
    un_educated: -0.1,
    poor_wealthy: 0,
  },
  gang4: {
    evil_good: 0.1,
    passive_aggressive: 0.1,
    lawless_lawful: -0.1,
    anti_authority: -0.2,
    un_educated: 0.2,
    poor_wealthy: -0.2,
  },
  labor: {
    evil_good: 0.2,
    passive_aggressive: -0.2,
    lawless_lawful: 0.2,
    anti_authority: -0.3,
    un_educated: -0.1,
    poor_wealthy: -0.3,
  },
  security: {
    evil_good: -0.1,
    passive_aggressive: 0.2,
    lawless_lawful: -0.2,
    anti_authority: 0.3,
    un_educated: -0.1,
    poor_wealthy: 0.1,
  },
  staff: {
    evil_good: 0.2,
    passive_aggressive: 0,
    lawless_lawful: -0.2,
    anti_authority: 0,
    un_educated: 0.1,
    poor_wealthy: -0.2,
  },
  visitors: {
    evil_good: 0,
    passive_aggressive: 0,
    lawless_lawful: 0,
    anti_authority: 0,
    un_educated: 0,
    poor_wealthy: 0,
  },
  sexworkers: {
    evil_good: 0,
    passive_aggressive: 0,
    lawless_lawful: 0,
    anti_authority: -0.1,
    un_educated: -0.1,
    poor_wealthy: -0.1,
  },
  doctors: {
    evil_good: 0,
    passive_aggressive: 0,
    lawless_lawful: 0.1,
    anti_authority: 0,
    un_educated: 0.1,
    poor_wealthy: 0.1,
  },
  maintenance: {
    evil_good: 0,
    passive_aggressive: -0.1,
    lawless_lawful: 0.1,
    anti_authority: 0.1,
    un_educated: -0.1,
    poor_wealthy: -0.1,
  },
  custodians: {
    evil_good: 0.1,
    passive_aggressive: 0.1,
    lawless_lawful: -0.1,
    anti_authority: -0.1,
    un_educated: -0.2,
    poor_wealthy: -0.2,
  },
}

// need npcs interface?
export default class WorldNpcs {
  private _all: Npcs
  order: string[]
  quests: QuestMethods
  constructor() {
    this._all = { ...NpcsInitState }
    this.order = []
    random_attributes(this.all, this.order)
    this.quests = {
      return_doctors: this.return_doctors.bind(this),
      return_all: this.return_all.bind(this),
      return_order_all: this.return_order_all.bind(this),
    }
    this.return_doctors = this.return_doctors.bind(this)
  }
  public get all(): Npcs {
    return this._all
  }
  set_an_npc(n: Npc) {
    this.all[n.labelname] = { ...n }
  }
  return_doctors(): Npc[] {
    return [this.all.doc01, this.all.doc02]
  }
  return_all(): Npcs {
    return this.all
  }
  sort_npcs_by_encounter() {
    this.order.sort(
      (a: string, b: string) =>
        this.all[b].turns_since_encounter - this.all[a].turns_since_encounter
    )
  }
  return_order_all(): [string[], Npcs] {
    return [shuffle(this.order), this.all]
  }
}

function adjust_binaries(value: number, clan: string, binary: string) {
  let adj = binarylookup[clan][binary] + value + math.random(-4, 4) / 10
  if (adj > 1) {
    adj = 1
  } else if (adj < -1) {
    adj = -1
  }

  return adj
}

function random_attributes(npcs: Npcs, order: string[]) {
  const ai_paths = ['inky', 'blinky', 'pinky', 'clyde']
  const startskills = [1, 2, 3, 5, 7, 7, 8, 8]
  const startbins = [-1, -0.5, -0.1, 0.1, 0.5, 1]
  let path = 0
  let count = 1

  let kn: keyof typeof npcs
  for (kn in npcs) {
    print('kn:', kn)
    order.splice(count, 0, kn)
    npcs[kn].turns_since_encounter = math.random(5, 15)
    npcs[kn].love = math.random(-1, 1)
    // random attitude
    npcs[kn].attitudes = {}
    let kbl: keyof typeof binarylookup
    for (kbl in binarylookup) {
      npcs[kn].attitudes[kbl] = math.random(-9, 9)
    }
    if (path > 3) {
      count++
      path = 0
      if (count > 5) count = 1
    }
    npcs[kn].race = `race0${path + 1}_0${count}`
    npcs[kn].ai_path = ai_paths[path]
    path = path + 1

    // random skills
    const tempskills = shuffle(startskills)
    let s_count = 0

    npcs[kn].skills = {}
    let ks: keyof typeof skills
    for (ks in skills) {
      npcs[kn].skills[ks] = tempskills[s_count] + math.random(-1, 1)
      s_count = s_count + 1
    }

    // random binaries
    const tempbins = shuffle(startbins)
    let b_count = 0

    npcs[kn].binaries = {}
    let kb: keyof typeof binaries
    for (kb in binaries) {
      const adjustment = adjust_binaries(tempbins[b_count], npcs[kn].clan, kb)
      npcs[kn].binaries[kb] = adjustment
      b_count = b_count + 1
    }

    // inventory bonuses
    // const inventory: hash[] = npcs[kn].inventory

    /**TESTJPF TODO:::
     * reapply this when youve replaced all

    for (const item of npcs[kn].inventory) {
      print('testjpf ITEM: ', item)
      const params = { npc: npcs[kn], item }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      chest.add_chest_bonus(params)
    }     */
  }
}
