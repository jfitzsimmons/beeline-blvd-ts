import { Effect, Npc } from '../../types/state'

//const utils = require "main.utils.utils"

export const fx: { [key: string]: Effect } = {
  crimewave: {
    label: 'crimewave',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'lawless_lawful',
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
      type: 'attitudes',
      stat: '',
      adjustment: 3,
    },
  },
  opportunist: {
    label: 'opportunist',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'lawless_lawful',
      adjustment: -0.2,
    },
  },
  amped: {
    label: 'amped',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'passive_aggressive',
      adjustment: 0.2,
    },
  },
  prejudice: {
    label: 'prejudice',
    turns: 10,
    fx: {
      type: 'attitudes',
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
// testjpf probably makes more sense to s} a key that deep copy
export function remove_effects_bonus(a: Npc, e: Effect) {
  a[e.fx.type][e.fx.stat] = a[e.fx.type][e.fx.stat] - e.fx.adjustment
}

export function add_effects_bonus(a: Npc, e: Effect) {
  print(
    'add_effects_bonus',
    a.labelname,
    'type:',
    e.fx.type,
    'stat:',
    e.fx.stat
  )
  a[e.fx.type][e.fx.stat] = a[e.fx.type][e.fx.stat] + e.fx.adjustment
}

export function remove_effects(a: Npc) {
  if (a.effects.length > 0) {
    //let eKey: keyof typeof
    for (const effect of a.effects) {
      if (effect.turns < 0) {
        remove_effects_bonus(a, effect)

        a.effects.splice(a.effects.indexOf(effect), 1)
      } else {
        effect.turns = effect.turns - 1
      }
    }
  }
}
