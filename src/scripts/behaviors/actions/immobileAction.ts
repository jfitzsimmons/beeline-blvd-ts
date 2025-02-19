import ActorState from '../../states/actor'
import Action from '../action'

export default class ImmobileAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    /**
     * TESTJPF TODO!!!
     */
    //if (testjpfimmobile) return () => this.alternate(ImmobileAction(this))
    // if (testjpf) return () => this.fail('youfailed')
    return () => this.success()
  }
}
