import { ActionProps, BehaviorKeys } from '../../../types/behaviors'
import Storage from '../../states/storage'
import Action from '../action'
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
    super()
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
