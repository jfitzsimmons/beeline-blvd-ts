import { Unlock } from '../../../types/tasks'
import { wtm0injured, wtm1procure } from '../tasks/checkpoints/tutorial/stage0'

export default {
  // seems like there should be a prior
  // unlock just to injure the man?
  // an npcsys that accepts a quest message
  // with props for add / remove
  //!!! maybe add a prop to UNLOCK that is a func
  // called check()
  /**
   * testjpf
   * need to redo novel state.
   * need to add novelKEys[] to npc
   */
  wtm0injured: {
    id: 'wtm0injured',
    unlock: (p: string) => wtm0injured({ patient: p }),
  },
  wtm1procure: {
    id: 'wtm1procure',
    unlock: (p: string) => wtm1procure({ patient: p }),
  },
} as { [key: string]: Unlock }
