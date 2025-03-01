import {
  ActionProps,
  BehaviorKeys,
  MendeeProps,
} from '../../../types/behaviors'
import Action from '../action'
import Sequence from '../sequence'
import InfirmSequence from '../sequences/infirmSequence'

export default class MendeeAction extends Action {
  a: MendeeProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('mendee') as MendeeProps
    super(props)
    this.a = props
    this.getProps = getProps
  }
  run(): { (): void } {
    // const { actor: a } = this
    // if (!isNpc(this.a)) return () => this.fail('NO MendeeAction for Player')
    this.a.sincePlayerRoom = 98
    //testjpf os this needed?
    //is it duping in the ignore array?
    this.a.addIgnore(this.a.name)
    this.a.addAdjustMendingQueue(this.a.name)

    if (math.random() > 0.4) this.a.hp = this.a.hp + 1
    print('MendeeAction for::', this.a.name, '| HP:', this.a.hp)
    if (this.a.hp > 4) {
      /**
       * testjpf
       * update hp inside of removeMendee
       * but FIRST move mendingQueue from Tasks to NPCS
       */
      this.a.returnNpc(this.a.name).hp = 5
      this.a.removeMendee(this.a.name)
      print('MendeeAction::', this.a.name, 'IS BEING INFIRMED')
      return () => this.delay(new InfirmSequence(this.getProps))
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
    this.a.addToBehavior('place', s)
  }
}
