import {
  ActionProps,
  BehaviorKeys,
  InjuredProps,
} from '../../../types/behaviors'
import Action from '../action'
import Sequence from '../sequence'
//import QuestionSequence from '../sequences/questionSequence'

export default class TrespassAction extends Action {
  a: InjuredProps
  doc = ''
  getProps: (behavior: BehaviorKeys) => () => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => () => ActionProps) {
    const props = getProps('injured')() as InjuredProps
    super(props)
    this.a = props
    this.getProps = getProps
  }
  run(): { (): void } {
    this.a.sincePlayerRoom = 96 // so can add QuestionSeq to available security
    if (this.a.getIgnore().includes(this.a.name))
      return () =>
        this.continue('TrespassAction:: IGNORE - injured NPC???:' + this.a.name)

    const authority = Object.values(
      this.a.getOccupants(this.a.currRoom)
    ).filter(
      (s) => s != '' && s != this.a.name && this.a.name.slice(0, 4) === 'secu'
    )

    for (const e of authority) {
      const enforcer = this.a.returnNpc(e)
      if (enforcer.sincePlayerRoom < 96 && math.random() > 0.4) {
        /**
         * testjpf
         * options:?:
         * warn
         * arrest?
         *
         * current
         * does :: confrontation_check(cop.traits, this._all[target].traits) == true
         * adds questioning task for security (means I probably should sort trespassers)
         * so need QuestioningSequence for security
         */
        ///STARTHERE
        // enforcer.addToBehavior(
        //  'active',
        //  new QuestionSequence(enforcer.getBehaviorProps('question'))
        /**
           * testjpf
           * needs to do:::
  npc_confront_consequence() {
    if (this.label == 'arrest') {
      this.parent.returnNpc(this.target).fsm.setState('arrestee')
      return
    } else if (this.label == 'questioning') {
      //testjpf convert rest!!!:::
      const tempcons: Array<
        (s: string, w: string) => { pass: boolean; type: string }
      > = shuffle([
        this.checks.pledgeCheck!.bind(this),
        this.checks.bribeCheck!.bind(this),
        this.checks.targetPunchedCheck!.bind(this),
        this.checks.jailtime_check!.bind(this),
        this.checks.admirer_check!.bind(this),
        this.checks.prejudice_check!.bind(this),
        this.checks.unlucky_check!.bind(this),
      ])
      this.checks.build_consequence!(this, this.owner, tempcons, false)
            
          so I think these will all return either a new Seq/Action
          or an effect.
          It's a weird setup where these checks are integrated with the Task class. These are all TASK class things that are initialized
          I think I can import directly into the sequence
          need to pass it traits, which I can do like EffectsAction
          This'll be huge


           */
      }
    }

    return () =>
      this.continue(
        'TrespassAction:: Default - Add PlaceSequnce for:' + this.a.name
      )
  }
  continue(s: string): string {
    print('TrespassAction:: Continue:', s)
    return 'continue'
  }
  alternate(as: Action | Sequence): string | void {
    /**
    if (this.doc != '') {
      const doc = this.a.returnNpc(this.doc)
      doc.sincePlayerRoom = 98
      doc.behavior.active.children.push(
        new MenderSequence(doc.getBehaviorProps.bind(this), this.a)
      )
      print(
        'injuredAction:: alternate doc mender sequence:: doc,a:',
        this.doc,
        this.a.name,
        doc.behavior.active.children.length
      )
    }
      */
    // new MenderSequence(this.a.parent.returnNpc(this.doc), this.a.name).run()
    return as instanceof Action ? as.run()() : as.run()
  }
}
