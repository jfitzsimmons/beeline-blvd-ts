import { NpcDefaults } from '../../../types/state'
const npc_defaults: NpcDefaults = {
  convos: 0,
  actions: ['talk', 'give', 'trade', 'pockets'],
  ai_path: '',
  matrix: { x: 0, y: 0 },
  attitudes: {},
  skills: {},
  binaries: {},
  turns_since_encounter: 0,
  love: 0,
  hp: 5,
  cooldown: 0,
  effects: [],
  currentroom: '',
  exitroom: '',
  currentstation: '',
}
export const NpcsInitState = {
  labor01: {
    home: { x: 0, y: 2 }, //loading
    labelname: 'labor01',
    inventory: ['tomato'],
    clearence: 1,
    clan: 'labor',
    ...npc_defaults,
  },
  labor02: {
    home: { x: 1, y: 1 }, //warehouse
    labelname: 'labor02',
    inventory: ['mushroom03'],
    clearence: 1,
    clan: 'labor',
    ...npc_defaults,
  },
  labor03: {
    home: { x: 4, y: 1 }, //maintenance
    labelname: 'labor03',
    inventory: [],
    clearence: 1,
    clan: 'labor',
    ...npc_defaults,
  },
  labor04: {
    home: { x: 0, y: 5 },
    labelname: 'labor04',
    inventory: [],
    clearence: 1,
    clan: 'labor',
    ...npc_defaults,
  },
  doc02: {
    home: { x: 0, y: 4 },
    labelname: 'doc02',
    inventory: [],
    clearence: 1,
    clan: 'doctors',
    ...npc_defaults,
  },
  doc01: {
    home: { x: 4, y: 4 },
    labelname: 'doc01',
    inventory: ['orange'],
    clearence: 1,
    clan: 'doctors',
    ...npc_defaults,
  },
  contractor02: {
    home: { x: 2, y: 2 },
    labelname: 'contractor02',
    inventory: [],
    clearence: 0,
    clan: 'contractors',
    ...npc_defaults,
  },
  contractor01: {
    home: { x: 2, y: 4 }, //admin1
    labelname: 'contractor01',
    inventory: ['earrings'],
    clearence: 0,
    clan: 'contractors',
    ...npc_defaults,
  },
  visitor02: {
    home: { x: 0, y: 4 }, //grounds
    labelname: 'visitor02',
    inventory: ['mushroom02'],
    clearence: 0,
    clan: 'visitors',
    ...npc_defaults,
  },
  visitor01: {
    home: { x: 2, y: 3 }, //lobby
    labelname: 'visitor01',
    inventory: ['leaf02'],
    clearence: 0,
    clan: 'visitors',
    ...npc_defaults,
  },
  sexworker01: {
    home: { x: 4, y: 3 }, //pubgrill
    labelname: 'sexworker01',
    inventory: ['magicb2'],
    clearence: 1,
    clan: 'sexworkers',
    ...npc_defaults,
  },
  sexworker02: {
    home: { x: 4, y: 2 }, //inn
    labelname: 'sexworker02',
    inventory: ['leaf01'],
    clearence: 0,
    clan: 'sexworkers',
    ...npc_defaults,
  },
  church01: {
    home: { x: 3, y: 2 }, //chapel
    labelname: 'church01',
    inventory: ['mirror'],
    clearence: 1,
    clan: 'church',
    ...npc_defaults,
  },
  church02: {
    home: { x: 4, y: 4 }, //store
    labelname: 'church02',
    inventory: ['string'],
    clearence: 0,
    clan: 'church',
    ...npc_defaults,
  },
  eve: {
    home: { x: 1, y: 4 }, //reception
    labelname: 'eve',
    inventory: ['bronze', 'glove01'],
    clearence: 1,
    clan: 'staff',
    ...npc_defaults,
  },
  tyler: {
    home: { x: 4, y: 2 }, //inn1
    labelname: 'tyler',
    inventory: ['banana', 'cape'],
    clearence: 1,
    clan: 'staff',
    ...npc_defaults,
  },
  frank: {
    home: { x: 4, y: 5 }, //dorm
    labelname: 'frank',
    inventory: ['envelope', 'vial01'],
    clearence: 1,
    clan: 'staff',
    ...npc_defaults,
  },
  staff04: {
    home: { x: 4, y: 4 }, //store
    labelname: 'staff04',
    inventory: ['fish01', 'gold'],
    clearence: 1,
    clan: 'staff',
    ...npc_defaults,
  },
  staff05: {
    home: { x: 2, y: 0 }, //alley3
    labelname: 'staff05',
    inventory: ['steak02'],
    clearence: 1,
    clan: 'staff',
    ...npc_defaults,
  },
  bruiser: {
    home: { x: 4, y: 1 }, //maint
    labelname: 'bruiser',
    inventory: ['egg01', 'mallot'],
    clearence: 1,
    clan: 'gang1',
    ...npc_defaults,
  },
  lou: {
    home: { x: 1, y: 0 }, //alley2
    labelname: 'lou',
    inventory: ['avacado'],
    clearence: 1,
    clan: 'gang1',
    ...npc_defaults,
  },
  spike: {
    home: { x: 4, y: 3 },
    labelname: 'spike',
    inventory: ['rose'],
    clearence: 1,
    clan: 'gang2',
    ...npc_defaults,
  },
  curly: {
    home: { x: 4, y: 5 },
    labelname: 'curly',
    inventory: ['berry02'],
    clearence: 1,
    clan: 'gang2',
    ...npc_defaults,
  },
  gang302: {
    home: { x: 0, y: 0 },
    labelname: 'gang302',
    inventory: ['shrimp02'],
    clearence: 1,
    clan: 'gang3',
    ...npc_defaults,
  },
  gang301: {
    home: { x: 3, y: 3 },
    labelname: 'gang301',
    inventory: ['magicc5'],
    clearence: 1,
    clan: 'gang3',
    ...npc_defaults,
  },
  gang402: {
    home: { x: 3, y: 4 },
    labelname: 'gang402',
    inventory: ['fish02', 'sunhat'],
    clearence: 1,
    clan: 'gang4',
    ...npc_defaults,
  },
  gang401: {
    home: { x: 4, y: 5 },
    labelname: 'gang401',
    inventory: ['eyeball02'],
    clearence: 1,
    clan: 'gang4',
    ...npc_defaults,
  },
  corps02: {
    home: { x: 2, y: 4 }, //admin1
    labelname: 'corps02',
    inventory: ['magicb3'],
    clearence: 1,
    clan: 'corps',
    ...npc_defaults,
  },
  corps01: {
    home: { x: 3, y: 5 }, //admin2
    labelname: 'corps01',
    inventory: ['sack'],
    clearence: 1,
    clan: 'corps',
    ...npc_defaults,
  },
  corps03: {
    home: { x: 1, y: 5 }, //vip
    labelname: 'corps03',
    inventory: ['magica4'],
    clearence: 1,
    clan: 'corps',
    ...npc_defaults,
  },
  security001: {
    home: { x: 1, y: 3 }, //customs
    labelname: 'security001',
    inventory: ['potion'],
    clearence: 1,
    clan: 'security',
    ...npc_defaults,
  },
  security002: {
    //matrix: { x: 3, y: 6 },
    home: { x: 0, y: 3 }, //baggage
    labelname: 'security002',
    inventory: ['ring'],
    clearence: 1,
    clan: 'security',
    ...npc_defaults,
  },
  security003: {
    home: { x: 4, y: 4 }, //store
    labelname: 'security003',
    inventory: ['drumstick01'],
    clearence: 2,
    clan: 'security',
    ...npc_defaults,
  },
  security004: {
    home: { x: 4, y: 1 }, //maint
    labelname: 'security004',
    inventory: ['coffeemug'],
    clearence: 2,
    clan: 'security',
    ...npc_defaults,
  },
}
