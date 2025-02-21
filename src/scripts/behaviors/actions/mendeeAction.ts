import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import InfirmAction from './infirmAction'

export default class MendeeAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    const { actor: a } = this
    if (!isNpc(a)) return () => this.fail('NO MendeeAction for Player')
    a.sincePlayerRoom = 98
    a.parent.addIgnore(a.name)
    a.parent.addAdjustMendingQueue(a.name)

    a.hp = a.hp + 1
    if (a.hp > 4) {
      const vacancy = a.parent.sendToVacancy('infirmary', a.name)
      if (vacancy != null) {
        a.currStation = vacancy
        //a.fsm.setState('infirm')
        return () => this.alternate(new InfirmAction(a))
      }
    } else {
      a.parent.pruneStationMap(a.currRoom, a.currStation)
    }

    print('MendeeAction for::', a.name)

    return () => this.success()
  }
}
