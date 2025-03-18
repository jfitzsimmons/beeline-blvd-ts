import { ActionProps } from '../../types/behaviors'
import Sequence from './sequence'

export default class Action {
  actor: ActionProps
  constructor(actorProps: ActionProps) {
    this.actor = actorProps
    this.run = this.run.bind(this)
    this.fail = this.fail.bind(this)
    this.success = this.success.bind(this)
    this.alternate = this.alternate.bind(this)
    this.continue = this.continue.bind(this)
  }
  run(): () => void | string {
    return () => print('ACTIONclass run()default::: ')
  }
  fail(str: string) {
    print('|||>>> Behavior: ACTIONfailed', str)
  }
  success() {
    print('ACTIONsuccess')
  }
  alternate(as: Action | Sequence) {
    return as instanceof Action ? as.run()() : as.run()
  }
  delay(s: Sequence) {
    print('ACTION DELAYED ::', typeof s)
    //  if (isNpc(this.actor)) this.actor.behavior.active.children.push(s)
  }
  continue(s = 'continue'): string {
    print('ActionContinue:::', s)
    return s
  }
  update(): void {
    print('ACTION updated')
  }
}
