import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import Sequence from '../sequence'

export default class InjuryAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    const { actor: a } = this
    //testjpf oninjurystart
    if (isNpc(a)) {
      a.sincePlayerRoom = 99
      a.parent.addInjured(a.name)
      a.parent.pruneStationMap(a.currRoom, a.currStation)
    }
    a.hp = 0
    print('InjuryAction:: return delay(InjuredSequence):', a.name)

    //make the rest injuredAction???
    //will also need onSCreen logic
    //instead of Place sequence, behavior should be InjuredSequence??
    return () => this.continue('DEARGOD TRYINGTOCONT THE INJURYACTION')
    //a.behavior.children.push(new InjuredSequence(a))

    /**
    if (a.cooldown > 0) a.cooldown = a.cooldown - 1
    a.exitRoom = RoomsInitLayout[a.matrix.y][a.matrix.x]!
    if (a.hp < 1) {
      return () => this.alternate(new InjuryAction(a))
    }
    if (a instanceof NpcState) {
      a.parent.clearStation(a.currRoom, a.currStation, a.name)
      const target = RoomsInitState[a.parent.getPlayerRoom()].matrix
      const rooms = a.makePriorityRoomList(target)
      a.findRoomPlaceStation(rooms)
    }

    if (testjpfimmobile) return () => this.alternate(ImmobileAction(this))
    if (testjpf) return () => this.fail('youfailed')
    
    **/
    //return () => this.success()
  }
  delay(a: ActorState, s: Sequence) {
    print(
      a.name,
      'ANYTHIGNATALL!!! a.behavior.active.children',
      a.behavior.active.children.length
    )

    a.behavior.active.children.push(s)

    print(
      a.name,
      'ANYTHIGNATALL!!!!!!@@@@@@22222',
      a.behavior.active.children.length
    )

    return () =>
      print(
        a.name,
        'INJUREDSEQUENCE DELAYED FOR::a.behavior.active.children',
        a.behavior.active.children.length
      )
  }
}
