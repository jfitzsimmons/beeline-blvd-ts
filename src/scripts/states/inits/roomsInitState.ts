import { Room } from '../../../types/state'

export const RoomsInitState: { [key: string]: Room } = {
  security: {
    matrix: { x: 2, y: 5 },
    roomName: 'security',
    clearance: 3,
    swaps: {
      assistant: ['aid', ''],
      guest: ['guest2', ''],
    },
    stations: {
      guard: '',
      authority: '',
      assistant: '',
      guest: '',
      servants2: '',
    },
    wards: { prisoner1: '', prisoner2: '', prisoner3: '', prisoner4: '' },
    actors: {},
  },
  baggage: {
    matrix: { x: 0, y: 4 },
    roomName: 'baggage',
    clearance: 2,
    swaps: {
      worker1: ['worker2', ''],
      guard: ['patrol', ''],
    },
    stations: {
      guard: '',
      worker1: '',
      assistant: '',
      browse: '',
      vipguest: '',
      bench: '',
    },
    actors: {
      luggage_1: {
        inventory: ['tomato', 'mushroom03', 'orange'],
        watcher: 'browse',
        actions: ['open'],
      },
      luggage_2: {
        inventory: ['mushroom02', 'banana', 'vial01'],
        watcher: 'guard',
        actions: ['open'],
      },
    },
  },
  viplobby: {
    matrix: { x: 1, y: 5 },
    roomName: 'viplobby',
    clearance: 2,
    swaps: {},
    stations: {
      guard: '',
      vipguest: '',
      boss: '',
      authority: '',
      host: '',
      desk: '',
      servants1: '',
    },
    actors: {},
  },
  entrance: {
    matrix: { x: 0, y: 5 },
    roomName: 'entrance',
    clearance: 0,
    swaps: {},
    stations: {
      loiter2: '',
      worker1: '',
      loiter3: '',
      guest: '',
      guest2: '',
      host: '',
    },
    actors: {},
  },
  recroom: {
    matrix: { x: 3, y: 3 },
    roomName: 'recroom',
    clearance: 1,
    swaps: {},
    stations: {
      lounge: '',
      loiter1: '',
      loiter2: '',
      worker2: '',
      guest: '',
      bench: '',
      browse: '',
    },
    actors: {},
  },
  chapel: {
    matrix: { x: 3, y: 2 },
    roomName: 'chapel',
    clearance: 1,
    swaps: {},
    stations: {
      loiter1: '',
      loiter2: '',
      authority: '',
      loiter3: '',
      guest: '',
      loiter4: '',
    },
    actors: {},
  },
  inn1: {
    matrix: { x: 4, y: 2 },
    roomName: 'inn1',
    clearance: 1,
    swaps: {},
    stations: {
      loiter3: '',
      host: '',
      tender: '',
      guest: '',
      lounge: '',
      loiter1: '',
    },
    actors: {},
  },
  pubgrill: {
    matrix: { x: 4, y: 3 },
    roomName: 'pubgrill',
    clearance: 1,
    swaps: {},
    stations: {
      host: '',
      bar: '',
      table: '',
      tender: '',
      loiter3: '',
      guest: '',
    },
    actors: {},
  },
  maintenance: {
    matrix: { x: 4, y: 1 },
    roomName: 'maintenance',
    clearance: 2,
    swaps: {},
    stations: { bench: '', patrol: '', browse: '', worker1: '' },
    actors: {},
  },
  lobby: {
    matrix: { x: 2, y: 3 },
    roomName: 'lobby',
    clearance: 1,
    swaps: {},
    stations: {
      loiter1: '',
      loiter2: '',
      guard: '',
      loiter4: '',
      table: '',
      guest: '',
      loiter3: '',
    },
    actors: {},
  },
  storage: {
    matrix: { x: 3, y: 1 },
    roomName: 'storage',
    clearance: 1,
    swaps: {},
    stations: {
      patrol: '',
      guard: '',
      assistant: '',
      browse: '',
      employee: '',
    },
    actors: {},
  },
  commonsint: {
    matrix: { x: 2, y: 2 },
    roomName: 'commonsint',
    clearance: 1,
    swaps: {},
    stations: {
      loiter1: '',
      loiter2: '',
      loiter3: '',
      loiter4: '',
      lounge: '',
      guest: '',
      servants1: '',
    },
    actors: {},
  },
  commonsext: {
    matrix: { x: 2, y: 1 },
    roomName: 'commonsext',
    clearance: 1,
    swaps: {},
    stations: {
      loiter1: '',
      loiter2: '',
      loiter3: '',
      patrol: '',
      table: '',
      guest: '',
      servants2: '',
    },
    actors: {},
  },
  warehouse: {
    matrix: { x: 1, y: 1 },
    roomName: 'warehouse',
    clearance: 2,
    swaps: {},
    stations: { worker1: '', worker2: '', boss: '' },
    actors: {},
  },
  lockers: {
    matrix: { x: 1, y: 2 },
    roomName: 'lockers',
    clearance: 1,
    swaps: {},
    stations: {
      loiter1: '',
      patrol: '',
      loiter2: '',
      table: '',
      lounge: '',
      guest: '',
      servants2: '',
    },
    actors: {},
  },
  unloading: {
    matrix: { x: 0, y: 1 },
    roomName: 'unloading',
    clearance: 2,
    swaps: {},
    stations: {
      worker1: '',
      worker2: '',
      boss: '',
      servants1: '',
      gang: '',
      guard: '',
    },
    actors: {},
  },
  alley3: {
    matrix: { x: 2, y: 0 },
    roomName: 'alley3',
    clearance: 1,
    swaps: {},
    stations: {
      worker1: '',
      servants1: '',
      gang: '',
      loiter2: '',
      loiter4: '',
      servants2: '',
      patrol: '',
    },
    actors: {},
  },
  alley2: {
    matrix: { x: 1, y: 0 },
    roomName: 'alley2',
    clearance: 2,
    swaps: {},
    stations: {
      worker1: '',
      servants1: '',
      gang: '',
      loiter2: '',
      guard: '',
    },
    actors: {},
  },
  alley1: {
    matrix: { x: 0, y: 0 },
    roomName: 'alley1',
    clearance: 2,
    swaps: {},
    stations: {
      worker1: '',
      worker2: '',
      servants1: '',
      gang: '',
      patrol: '',
    },
    actors: {},
  },
  loading: {
    matrix: { x: 0, y: 2 },
    roomName: 'loading',
    clearance: 2,
    swaps: {},
    stations: { worker1: '', worker2: '', boss: '', patrol: '', gang: '' },
    actors: {},
  },
  admin1: {
    matrix: { x: 2, y: 4 },
    roomName: 'admin1',
    clearance: 2,
    props: ['desks', 'locker'],
    swaps: {
      boss: ['servants2', ''],
      patrol: ['guest', ''],
    },
    stations: {
      monitor: '',
      patrol: '',
      guard: '',
      assistant: '',
      boss: '',
      desk: '',
    },
    actors: {
      desks: {
        inventory: ['fish01', 'steak02', 'egg01'],
        actions: ['pickup', 'use'],
      },
      locker: {
        inventory: ['avacado', 'berry02', 'shrimp02'],
        actions: ['use', 'open'],
      },
    },
  },
  customs: {
    matrix: { x: 1, y: 3 },
    roomName: 'customs',
    clearance: 0,
    props: ['desks', 'locker'],
    swaps: {
      loiter1: ['loiter2', ''],
      patrol: ['gang', ''],
    },
    stations: {
      desk: '',
      loiter1: '',
      guard: '',
      patrol: '',
      loiter3: '',
      loiter4: '',
      guest: '',
    },
    actors: {
      desks: {
        inventory: ['deskbook01', 'globegold', 'fish02'],
        actions: ['pickup', 'use'],
      },
      locker: {
        inventory: ['silver', 'mushroom01', 'potion'],
        actions: ['use', 'open'],
      },
      vase3: {
        inventory: ['steak02', 'leaf03', 'daisy', 'mushroom02'],
        actions: ['open'],
        watcher: 'patrol',
      },
    },
  },
  reception: {
    matrix: { x: 1, y: 4 },
    roomName: 'reception',
    clearance: 0,
    props: ['drawer', 'computer'],
    swaps: {
      loiter4: ['loiter3', ''],
      guest2: ['lounge', ''],
      guard: ['boss', ''],
    },
    stations: {
      desk: '',
      patrol: '',
      guard: '',
      loiter2: '',
      loiter4: '',
      guest: '',
      guest2: '',
    },
    actors: {
      drawer: {
        inventory: ['cheese', 'shrimp01', 'drumstick01'],
        actions: ['open'],
        watcher: 'desk',
      },
      computer: {
        inventory: [],
        actions: ['use'],
        watcher: 'desk',
      },
      vase: {
        inventory: ['pillow', 'book', 'tomato'],
        actions: ['open'],
        watcher: 'loiter2',
      },
      vase2: {
        inventory: ['steak01', 'leaf03', 'daisy', 'mushroom03'],
        actions: ['open'],
        watcher: 'patrol',
      },
    },
  },
  grounds: {
    matrix: { x: 0, y: 4 },
    roomName: 'grounds',
    clearance: 0,
    swaps: {
      assistant: ['guard', ''],
      loiter1: ['loiter2', ''],
      guest: ['bench', ''],
    },
    stations: {
      assistant: '',
      worker1: '',
      aid: '',
      guest: '',
      worker2: '',
      loiter1: '',
      guest2: '',
    },
    actors: {
      player_luggage: {
        inventory: ['berry01', 'feather01', 'magica1', 'orange'],
        watcher: 'worker2',
        actions: ['open'],
      },
      other_luggage: {
        inventory: ['eyeball03', 'feather02', 'magicb1', 'mushroom02'],
        watcher: 'worker2',
        actions: ['open'],
      },
    },
  },
  dorms: {
    matrix: { x: 4, y: 5 },
    roomName: 'dorms',
    clearance: 1,
    swaps: {},
    stations: {
      bench: '',
      servants1: '',
      servants2: '',
      assistant: '',
      loiter2: '',
      gang: '',
      browse: '',
    },
    actors: {},
  },
  gym: {
    matrix: { x: 3, y: 4 },
    roomName: 'gym',
    clearance: 1,
    swaps: {},
    stations: {
      guest: '',
      browse: '',
      loiter2: '',
      loiter4: '',
      bench: '',
      servants1: '',
    },
    actors: {},
  },
  store: {
    matrix: { x: 4, y: 4 },
    roomName: 'store',
    clearance: 1,
    swaps: {},
    stations: {
      guest: '',
      servants1: '',
      employee: '',
      patrol: '',
      loiter3: '',
      worker1: '',
      loiter2: '',
    },
    actors: {},
  },
  infirmary: {
    matrix: { x: 3, y: 5 },
    roomName: 'infirmary',
    clearance: 3,
    props: ['drawer', 'computer'],
    swaps: {
      servants2: ['servants1', ''],
      loiter2: ['worker1', ''],
    },
    stations: {
      aid: '',
      loiter1: '',
      loiter2: '',
      assistant: '',
      loiter4: '',
      servants2: '',
    },
    wards: { patient1: '', patient2: '', patient3: '', patient4: '' },
    actors: {
      drawer: {
        inventory: ['vial02', 'banana', 'vial01'],
        actions: ['open'],
        watcher: 'assistant',
      },
      computer: {
        inventory: [],
        actions: ['use'],
        watcher: 'assistant',
      },
    },
  },
}

export const RoomsInitLayout = [
  ['alley1', 'alley2', 'alley3', null, null],
  ['unloading', 'warehouse', 'commonsext', 'storage', 'maintenance'],
  // put a hallway here testjpf!!!
  ['loading', 'lockers', 'commonsint', 'chapel', 'inn1'],
  ['baggage', 'customs', 'lobby', 'recroom', 'pubgrill'],
  ['grounds', 'reception', 'admin1', 'gym', 'store'],
  ['entrance', 'viplobby', 'security', 'infirmary', 'dorms'],
]
export const RoomsInitRoles: { [key: string]: string[] } = {
  desk: ['staff', 'security'],
  host: ['staff', 'gang1', 'gang2'],
  tender: ['staff', 'gang3', 'gang4'],
  bar: [
    'doctors',
    'corps',
    'visitors',
    'church',
    'contractors',
    'sexworkers',
    'labor',
    'security',
    'maintenance',
  ],
  table: [
    'doctors',
    'corps',
    'visitors',
    'church',
    'contractors',
    'sexworkers',
    'labor',
    'security',
    'custodians',
  ],
  bench: [
    'labor',
    'contractors',
    'gang1',
    'gang3',
    'maintenance',
    'mailroom',
    'doctors',
  ],
  browse: [
    'staff',
    'labor',
    'contractors',
    'gang2',
    'gang4',
    'security',
    'custodian',
  ],
  monitor: ['security', 'staff', 'corps', 'doctors', 'maintenance'],
  guard: ['security', 'gang1', 'gang3'],
  patrol: [
    'security',
    'gang2',
    'gang4',
    'corps',
    'staff',
    'custodians',
    'mailroom',
  ],
  loiter1: [
    'sexworkers',
    'visitors',
    'church',
    'corps',
    'gang1',
    'gang2',
    'contractors',
    'custodians',
  ],
  loiter2: [
    'sexworkers',
    'staff',
    'church',
    'gang3',
    'gang4',
    'contractors',
    'labor',
    'maintenance',
    'mailroom',
  ],
  loiter3: [
    'doctors',
    'sexworkers',
    'visitors',
    'staff',
    'corps',
    'security',
    'gang4',
    'labor',
    'mailroom',
  ],
  loiter4: [
    'doctors',
    'sexworkers',
    'visitors',
    'corps',
    'security',
    'gang4',
    'labor',
    'custodians',
    'mailroom',
  ],
  lounge: [
    'doctors',
    'sexworkers',
    'visitors',
    'staff',
    'church',
    'corps',
    'contractors',
    'labor',
    'maintenance',
  ],
  worker1: ['labor', 'gang1', 'gang3', 'gang4', 'contractors', 'mailroom'],
  worker2: ['labor', 'gang2', 'gang4', 'contractors', 'maintenance'],
  boss: ['corps', 'gang2', 'gang1', 'gang3', 'contractors'],
  assistant: ['gang2', 'gang1', 'gang3', 'contractors', 'staff', 'doctors'],
  aid: ['doctors', 'staff', 'labor', 'church', 'visitors', 'security'],
  guest: ['labor', 'church', 'visitors', 'contractors', 'sexworkers'],
  guest2: ['visitors', 'church', 'doctors'],
  vipguest: ['church', 'visitors', 'contractors', 'sexworkers', 'doctors'],
  authority: ['corps', 'church'],
  servants2: [
    'staff',
    'security',
    'gang2',
    'gang4',
    'church',
    'sexworkers',
    'labor',
    'custodians',
    'mailroom',
  ],
  servants1: [
    'staff',
    'gang1',
    'gang2',
    'gang3',
    'gang4',
    'church',
    'labor',
    'custodians',
  ],
  employee: ['staff', 'gang1', 'gang3', 'maintenance', 'mailroom'],
  gang: ['gang1', 'gang2', 'gang3', 'gang4'],
}
export const RoomsInitFallbacks = {
  swaps: {},
  stations: {
    admin1_passer: '',
    security_passer: '',
    reception_unplaced: '',
    grounds_unplaced: '',
    viplobby_outside1: '',
    security_outside1: '',
    infirmary_outside1: '',
    dorms_outside1: '',
  },
}
export const RoomsInitPriority = [
  'grounds',
  'reception',
  'baggage',
  'entrance',
  'customs',
  'viplobby',
  'admin1',
  'security',
  'lobby',
  'loading',
  'lockers',
  'commonsint',
  'infirmary',
  'gym',
  'recroom',
  'chapel',
  'unloading',
  'warehouse',
  'commonsext',
  'storage',
  'alley1',
  'alley2',
  'alley3',
  'store',
  'pubgrill',
  'dorms',
  'inn1',
  'maintenance',
]
