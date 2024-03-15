import { PlayerState } from '../../../types/state'

export const PlayerInitState: PlayerState = {
  currentroom: 'grounds',
  exitroom: '',
  matrix: { x: 0, y: 4 },
  //name:hash("/adam"),
  labelname: 'adam',
  inventory: ['axe', 'apple01'],
  pos: { x: 704, y: 448 },
  //levels_cleared:0,
  alert_level: 0,
  hp: 3,
  ap_max: 18,
  ap: 18,
  turns: 0,
  checkpoint: 'tutorialA',
  binaries: {
    evil_good: 0,
    passive_aggressive: 0,
    lawless_lawful: 0,
    anti_authority: 0,
    un_educated: 0,
    poor_wealthy: 0,
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
