import ActorState from '../../states/actor'
import Action from '../action'

export default class ImmobileAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    print('immobileAction for::', this.a)
    /**
     * TESTJPF TODO!!!
     */
    //if (testjpfimmobile) return () => this.alternate(ImmobileAction(this))
    // if (testjpf) return () => this.fail('youfailed')
    return () => this.success()
  }
}
