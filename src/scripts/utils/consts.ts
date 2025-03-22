import { Effect } from '../../types/tasks'

export const doctors = ['doc03', 'doc02', 'doc01']
export const SECURITY = [
  'security001',
  'security002',
  'security003',
  'security004',
  'security005',
]
export const fxLookup = {
  merits: [
    'admirer',
    'inspired',
    'eagleeye',
    'vanity',
    'readup',
    'yogi',
    'angel',
  ],
  demerits: [
    'prejudice',
    'boring',
    'distracted',
    'ignorant',
    'lazy',
    'dunce',
    'devil',
  ],
}

export const fx: { [key: string]: Effect } = {
  crimewave: {
    label: 'crimewave',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'lawlessLawful',
      adjustment: 0.2,
    },
  },
  yogi: {
    label: 'yogi',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'wisdom',
      adjustment: 2,
    },
  },
  angel: {
    label: 'angel',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'evil_good',
      adjustment: 0.2,
    },
  },
  devil: {
    label: 'devil',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'evil_good',
      adjustment: -0.2,
    },
  },
  inspired: {
    label: 'inspired',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'constitution',
      adjustment: 2,
    },
  },
  eagleeye: {
    label: 'eagleeye',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'perception',
      adjustment: 2,
    },
  },
  modesty: {
    label: 'modesty',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'poor_wealthy',
      adjustment: -0.2,
    },
  },
  admirer: {
    label: 'admirer',
    turns: 10,
    fx: {
      type: 'opinion',
      stat: '',
      adjustment: 3,
    },
  },
  opportunist: {
    label: 'opportunist',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'lawlessLawful',
      adjustment: -0.2,
    },
  },
  amped: {
    label: 'amped',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'passiveAggressive',
      adjustment: 0.2,
    },
  },
  prejudice: {
    label: 'prejudice',
    turns: 10,
    fx: {
      type: 'opinion',
      stat: '',
      adjustment: -3,
    },
  },
  incharge: {
    label: 'incharge',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'anti_authority',
      adjustment: 0.2,
    },
  },
  rebel: {
    label: 'rebel',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'anti_authority',
      adjustment: -0.2,
    },
  },
  boring: {
    label: 'boring',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'charisma',
      adjustment: -2,
    },
  },
  loudmouth: {
    label: 'loudmouth',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'stealth',
      adjustment: -2,
    },
  },
  vanity: {
    label: 'vanity',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'charisma',
      adjustment: 2,
    },
  },
  inhiding: {
    label: 'inhiding',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'stealth',
      adjustment: 2,
    },
  },
  inshape: {
    label: 'inshape',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'strength',
      adjustment: 2,
    },
  },
  readup: {
    label: 'readup',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'intelligence',
      adjustment: 2,
    },
  },
  dunce: {
    label: 'dunce',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'intelligence',
      adjustment: -2,
    },
  },
  lazy: {
    label: 'lazy',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'constitution',
      adjustment: -2,
    },
  },
  ignorant: {
    label: 'ignorant',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'wisdom',
      adjustment: -2,
    },
  },
  distracted: {
    label: 'distracted',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'perception',
      adjustment: -2,
    },
  },
}

export const immobile = ['mender', 'mendee', 'injury', 'infirm']
