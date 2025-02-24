import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import Sequence from '../sequence'
import InfirmSequence from '../sequences/infirmSequence'
//import Sequence from '../sequence'
//import MendeeSequence from '../sequences/mendeeSequence'

export default class MendeeAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
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
    print('MendeeAction for::', a.name, '| HP:', a.hp)
    if (a.hp > 4) {
      //testjpf
      //check for infirmed with most HP and boot them!?!?!
      //  const vacancy = a.parent.sendToVacancy('infirmary', a.name)
      // if (vacancy != null) {
      //  a.currStation = vacancy
      //a.fsm.setState('infirm')
      print('MendeeAction::', a.name, 'IS BEING INFIRMED')
      return () => this.delay(new InfirmSequence(a))
      //  }
    }
    //a.parent.pruneStationMap(a.currRoom, a.currStation)

    /**
     * seems I could add another MendeeSeq to next-turns place.children?
     *
     */
    return () => this.continue('mend')
  }
  continue(s: string): string {
    print(`${this.a.name} is continuing another MendeeSequence`)
    return s
  }
  delay(s: Sequence): void {
    this.a.behavior.place.children.push(s)
  }
}
