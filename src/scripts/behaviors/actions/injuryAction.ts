import ActorState from '../../states/actor'
import NpcState from '../../states/npc'
import Action from '../action'
import InjuredSequence from '../sequences/InjuredSequence'

export default class InjuryAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    const { actor: a } = this
    //testjpf oninjurystart
    if (a instanceof NpcState) {
      a.sincePlayerRoom = 99
      a.parent.addInjured(a.name)
    }
    a.hp = 0

    //make the rest injuredAction???
    //will also need onSCreen logic
    //instead of Place sequence, behavior should be InjuredSequence??

    a.behavior.children.push(new InjuredSequence(a))

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
    return () => this.success()
  }
}
