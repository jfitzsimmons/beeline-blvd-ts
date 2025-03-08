import {
  ActionProps,
  BehaviorKeys,
  QuestionProps,
} from '../../../types/behaviors'
import Action from '../action'
import {
  build_consequence,
  targetPunchedCheck,
  prejudice_check,
  unlucky_check,
  angel_check,
  becomeASnitchCheck,
  suspicious_check,
  vanity_check,
  watcher_punched_check,
} from '../../states/inits/checksFuncs'
import { shuffle } from '../../utils/utils'
import { removeValuable, removeAdvantageous } from '../../utils/inventory'
import Storage from '../../states/storage'
export default class ConfrontAction extends Action {
  a: QuestionProps
  perp: QuestionProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  storage?: Storage
  ///testjpf ii thinki can get by with isHero
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: QuestionProps,
    storage?: Storage
  ) {
    const props = getProps('question') as QuestionProps
    super(props)
    this.a = props
    this.perp = perp
    this.getProps = getProps
    this.storage = storage
    if (
      this.a.currRoom == this.perp.currRoom &&
      this.a.currRoom == this.a.getFocusedRoom()
    ) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: this.perp.currStation,
        npc: this.a.name,
      })
      // prettier-ignore
      print("NEWNEW",this.a.name, 'STATION MOVE VIA TASK confront', this.perp.name, 'in', this.a.currRoom)
    }
  }
  run(): { (): void } {
    const tempcons: Array<
      (
        chkr: QuestionProps,
        chkd: QuestionProps
      ) => { pass: boolean; type: string }
    > = shuffle([
      suspicious_check,
      becomeASnitchCheck,
      targetPunchedCheck,
      angel_check,
      vanity_check,
      prejudice_check,
      unlucky_check,
      watcher_punched_check,
    ])

    const consolation = build_consequence(this.a, this.perp, tempcons, false)
    print(
      'CONFRONTaction::: consolation after consequence:::',
      consolation,
      'confronter:',
      this.a.name,
      'perp:',
      this.perp.name,
      'inroom:',
      this.a.currRoom,
      this.perp.currRoom,
      '||| PLAYERROOM:',
      this.a.getFocusedRoom()
    )
    /***
     * testjpf seems here i need conditions that create new
     * sequences for different types of consolations
     * snitch, reckless, jailed (similar to questionAct!!!)
     */

    if (consolation == 'neutral') {
      const robbed = this.storage == undefined ? this.a : this.storage
      let chest_item = null
      /**
       * need sequence for snitch!!
       * need returns for chkfuncs call_security
       *
       
       * testjpf NEW
       * this is why you had that loot STATE prop
       * confront sequence needs loot.
       */

      if (math.random() < 0.4) {
        chest_item =
          robbed.inventory[math.random(0, robbed.inventory.length - 1)]
        //chest_item = removeRandom(this.a.inventory, ['apple01'])
      } else if (math.random() < 0.5) {
        chest_item = removeValuable(robbed.inventory)
      } else {
        chest_item = removeAdvantageous(
          robbed.inventory,
          this.perp.traits.skills
        )
      }

      if (chest_item !== null) {
        if (robbed.updateInventory !== undefined)
          robbed.updateInventory('delete', chest_item)
        this.perp.updateInventory('add', chest_item)
        //this.perp.addInvBonus(chest_item)
      }
      //if (victim == true ){ remove_chest_bonus(w, chest_item) }
      this.perp.cooldown = math.random(5, 15)
      return () =>
        this.fail(
          `ConfrontAction::: Failed:: ${this.a.name} had no effect on ${this.perp.name}`
        )
    }

    this.a.cooldown = this.a.cooldown + 5
    if (
      this.a.currRoom == this.perp.currRoom &&
      this.a.currRoom == this.a.getFocusedRoom()
    ) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: this.perp.currStation,
        npc: this.a.name,
      })
      // prettier-ignore
      print("runrun",this.a.name, 'STATION MOVE VIA TASK confront', this.perp.name, 'in', this.a.currRoom)
    }
    return () => this.success()
    //need something that checks response
    //does response need EffectsAction, sequences, something else???
    //testjpf
  }
}
