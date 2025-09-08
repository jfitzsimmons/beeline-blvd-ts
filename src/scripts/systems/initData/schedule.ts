import { Moment } from '../../../types/tasks'
import { receptionsStealStash1 } from '../../ai/levels/reception'
//import { wtm0injured, wtm1procure } from '../tasks/checkpoints/tutorial/stage0'

export default {
  //testjpf. can probably abstract stealstash to be more universal
  moments: {
    receptionsStealStash1: {
      id: 'receptionsStealStash1',
      moment: (p: string) => receptionsStealStash1(),
    },
    wtm1procure: {
      id: 'wtm1procure',
      moment: (p: string) => wtm1procure({ patient: p }),
    },
  },
} as { [key: string]: { [key: string]: Moment } }
