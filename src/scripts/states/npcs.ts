import { NpcsInitState } from './inits/npcsInitState'
import { NpcsState, Npcs, QuestMethods } from '../../types/state'
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
//const chest = require('../../main.systems.inventorysystem')

function shuffle(arrN: number[]): number[]
function shuffle(arrS: string[]): string[]
function shuffle(array: Array<string | number>): Array<string | number> {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// need npcs interface?
export default class WorldNpcs {
  private npcs: NpcsState
  private order: []
  quests: QuestMethods
  constructor() {
    this.npcs = { ...NpcsInitState }
    random_attributes(this.npcs.all)
    this.order = []
    this.quests = {
      return_doctors: this.return_doctors.bind(this),
      return_all: this.return_all.bind(this),
    }
  }

  return_doctors() {
    return [this.npcs.all.doc01, this.npcs.all.doc02]
  }
  return_all() {
    return this.npcs.all
  }
}

// TODO - testjpf
//abstract and import room types
// create efficient look for clear station in TS

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

// testjpf probably just need npcs type??
function random_attributes(npcs: Npcs) {
  const ai_paths = ['inky', 'blinky', 'pinky', 'clyde']
  const startskills = [1, 2, 3, 5, 7, 7, 8, 8]
  const startbins = [-1, -0.5, -0.1, 0.1, 0.5, 1]
  let path = 1
  /** 
  const _defaults = { ...npc_defaults }
  let knd: keyof typeof _defaults // Type is "one" | "two" | "three"
  for (knd in _defaults) {
    npcs[npcname][knd] = _defaults[knd]
  }
**/
  let kn: keyof typeof npcs // Type is "one" | "two" | "three"
  for (kn in npcs) {
    npcs[kn].turns_since_encounter = math.random(5, 15)
    npcs[kn].love = math.random(-1, 1)
    // random attitude
    let kbl: keyof typeof binarylookup // Type is "one" | "two" | "three"
    for (kbl in binarylookup) {
      npcs[kn].attitudes[kbl] = math.random(-9, 9)
    }

    if (path > 4) path = 1
    npcs[kn].ai_path = ai_paths[path]
    path = path + 1

    // random skills
    const tempskills = shuffle(startskills)
    let s_count = 0

    let ks: keyof typeof skills // Type is "one" | "two" | "three"
    for (ks in skills) {
      print(ks, ': tempskills[s_count]: ', tempskills[s_count])
      npcs[kn].skills[ks] = tempskills[s_count] + math.random(-1, 1)
      s_count = s_count + 1
    }

    // random binaries
    const tempbins = shuffle(startbins)
    let b_count = 0

    let kb: keyof typeof binaries // Type is "one" | "two" | "three"
    for (kb in binaries) {
      const adjustment = adjust_binaries(tempbins[b_count], npcs[kn].clan, kb)
      npcs[kn].binaries[kb] = adjustment
      b_count = b_count + 1
    }

    // inventory bonuses
    // const inventory: hash[] = npcs[kn].inventory
    // Type is "one" | "two" | "three"
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
