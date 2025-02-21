import ActorState from '../../states/actor'
import Action from '../action'

export default class ImmobileAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    print('immobileAction for:: TODO::', this.a.name)
    //testjpf do you infimrdseq, mender mendee,..
    // is this where a blackboard could come in?
    //in injuredAction::
    /**
      const doc = a.parent.returnNpc(helper)
      doc.behavior.active.children.push(new MenderSequence(doc, a.name))
      return () => this.alternate(new MendeeSequence(a))
     */
    // return () => this.delay()
    /**
     * TESTJPF TODO!!!
     */
    //if (testjpfimmobile) return () => this.alternate(ImmobileAction(this))
    // if (testjpf) return () => this.fail('youfailed')
    return () => this.success()
  }
}
