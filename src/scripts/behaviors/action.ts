import ActorState from '../states/actor'
import Sequence from './sequence'

export default class Action {
  action?: { (): void }
  actor: ActorState
  constructor(actorProps: ActorState) {
    this.actor = actorProps
    this.run = this.run.bind(this)
    this.fail = this.fail.bind(this)
    this.success = this.success.bind(this)
    this.alternate = this.alternate.bind(this)
  }
  run(): () => void {
    return () => print('ACTIONclass run()default::: ', this.actor.name)
  }
  fail(str: string) {
    print('ACTIONfailed', str)
  }
  success() {
    print('ACTIONsuccess')
  }
  alternate(as: Action | Sequence) {
    return as.run()
  }
  delay(a: ActorState, s: Sequence) {
    print('ACTION DELAYED FOR::', a.name, typeof s)
  }
}
