import { PlayerState } from '../../../types/state'

export const PlayerInitState: PlayerState = {
  currentroom: 'grounds',
  exitroom: '',
  matrix: { x: 0, y: 4 },
  //name:hash("/adam"),
  labelname: 'player',
  inventory: ['axe', 'apple01'],
  pos: { x: 704, y: 448 },
  //levels_cleared:0,
  heat: 0,
  alert_level: 0,
  hp: 3,
  ap_max: 18,
  ap: 18,
  turns: 0,
  clearance: 0,
  checkpoint: 'tutorialA',
  binaries: {
    evil_good: 0,
    passive_aggressive: 0,
    lawless_lawful: 0,
    anti_authority: 0,
    un_educated: 0,
    poor_wealthy: 0,
    mystical_logical: 0,
    noir_color: 0,
  },
  factions: {
    church: 0,
    contractors: 0,
    corps: 0,
    labor: 0,
    security: 0,
    staff: 0,
    visitors: 0,
    sexworkers: 0,
    doctors: 0,
    maintenance: 0,
    custodians: 0,
    mailroom: 0,
  },
  gangs: {
    gang1: 0,
    gang2: 0,
    gang3: 0,
    gang4: 0,
  },
  skills: {
    constitution: 5,
    charisma: 5, // deception?
    wisdom: 5,
    intelligence: 5,
    speed: 5,
    perception: 5, // insight
    strength: 5, //carrying capacity, intimidation
    stealth: 5, // !!
  },
  effects: [],
}
