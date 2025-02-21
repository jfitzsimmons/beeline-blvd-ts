import ActorState from '../../states/actor'
import Action from '../action'

export default class MendeeAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    const { actor: a } = this

    print('MendeeAction for::', a.name)

    return () => this.success()
  }
}
