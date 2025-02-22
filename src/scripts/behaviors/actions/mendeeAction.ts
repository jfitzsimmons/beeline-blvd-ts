import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
//import Sequence from '../sequence'
//import MendeeSequence from '../sequences/mendeeSequence'
import InfirmAction from './infirmAction'

export default class MendeeAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    const { actor: a } = this
    if (!isNpc(a)) return () => this.fail('NO MendeeAction for Player')
    a.sincePlayerRoom = 98
    //testjpf os this needed?
    //is it duping in the ignore array?
    a.parent.addIgnore(a.name)
    a.parent.addAdjustMendingQueue(a.name)

    a.hp = a.hp + 1
    print('MendeeAction for::', a.name)
    if (a.hp > 4) {
      const vacancy = a.parent.sendToVacancy('infirmary', a.name)
      if (vacancy != null) {
        a.currStation = vacancy
        //a.fsm.setState('infirm')
        print('MendeeAction::', a.name, 'IS BEING INFIRMED')
        return () => this.alternate(new InfirmAction(a))
      }
    } else {
      a.parent.pruneStationMap(a.currRoom, a.currStation)
    }
    /**
     * seems I could add another MendeeSeq to next-turns place.children?
     *
     */
    return () => this.continue(`${a.name} is continuing another MendeeSequence`)

    // a.behavior.place.children.push(new MendeeSequence(a))
    //return () => this.success()
  }
}
