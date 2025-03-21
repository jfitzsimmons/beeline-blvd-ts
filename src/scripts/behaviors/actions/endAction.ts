import {
  ActionProps,
  BehaviorKeys,
  // DefaultBehaviorProps,
} from '../../../types/behaviors'
import Storage from '../../states/storage'

import Action from '../action'
//testjpf DELTEE ME ?!?!?!?
export default class EndAction extends Action {
  props: [
    string,
    (behavior: BehaviorKeys) => ActionProps,
    ActionProps,
    string,
    Storage?
  ]
  constructor(
    sequenceProps: [
      string,
      (behavior: BehaviorKeys) => ActionProps,
      ActionProps,
      string,
      Storage?
    ]
  ) {
    //const props = getProps('injury') as DefaultBehaviorProps
    super()
    // this.a = props
    this.props = sequenceProps
  }
  run(): { (): void } {
    return () => this.success()
  }
  success(): [
    string,
    (behavior: BehaviorKeys) => ActionProps,
    ActionProps,
    string,
    Storage?
  ] {
    print(
      'EndAction:: Default: success :',
      this.props[0],
      this.props[2].name,
      this.props[3]
    )
    return this.props
  }
}
