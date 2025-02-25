import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import { doctors } from '../../utils/consts'
import Action from '../action'
//import PlaceSequence from '../sequences/placeSequence'

export default class InfirmedAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    print('infirmEDAction for::', this.a.name)
    if (isNpc(this.a)) {
      this.a.parent.isStationedTogether(doctors, 'infirmary') === true
        ? (this.a.hp = this.a.hp + 2)
        : (this.a.hp = this.a.hp + 1)

      if (this.a.hp > 9) {
        print('this.a.sincePlayerRoom', this.a.sincePlayerRoom)
        this.a.sincePlayerRoom = math.random(15, 40)
        print('INFIRMEDaction:: sinceplayerroom reset. RE-PLACE npc??') //this.a.fsm.setState('turn')
        print('this.a.sincePlayerRoom2', this.a.sincePlayerRoom)
        // this.a.behavior.place.children.push(new PlaceSequence(this.a))
        return () => this.success()
      }
      //tesjpf this could be moved to menderseq
      // as a 'default' with continue
      // this.a.behavior.place.children.push(new ImmobileSequence(this.a))
    }
    return () => this.continue('continue')
  }
}
