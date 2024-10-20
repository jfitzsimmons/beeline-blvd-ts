import { Caution, QuestMethods } from '../../types/tasks'
import NpcState from './npc'

const nullCaution: Caution = {
  type: '',
  label: 'none',
  time: 0,
  authority: '',
  suspect: '',
  npc: '',
  reason: '',
}
export default class WorldNovel {
  //private background: string
  //private sprites: { [key: string]: string }
  private _reason: string
  private _caution: Caution
  private _item: string
  private _active_quest: boolean
  private _priority: boolean
  private _npcsWithQuest: string[]
  private _scripts: string[]
  //private _alertChange: number
  private _npc: NpcState
  //private _quest: QuestCondition
  quests: QuestMethods

  constructor(initnpc: NpcState) {
    // this.background = ''
    //  this.sprites = {}
    this._active_quest = false
    this._priority = false
    this._reason = 'none'
    this._caution = nullCaution
    this._item = 'none'
    this._npcsWithQuest = []
    this._scripts = []
    // this._alertChange = 0
    this._npc = initnpc
    /** 
    this._quest = {
      label: '',
      passed: false,
      interval: [],
      func: [() => false],
      args: [],
    }*/
    this.quests = {
      get_reason: this.get_reason,
    }
    //Have something here like this.sprites.smile .laugh .sad etc....
    // set the sprites in the same function you set npc! TESTJPF
    this.append_npc_quest = this.append_npc_quest.bind(this)
    this.get_reason = this.get_reason.bind(this)
  }

  /*
  public get quest() {
    return this._quest
  }
  public set quest(c: QuestCondition) {
    this._quest = c
  }*/
  public get npcsWithQuest(): string[] {
    return this._npcsWithQuest
  }
  append_npc_quest(n: string) {
    this._npcsWithQuest.push(n)
  }
  remove_npc_quest(r: string) {
    this._npcsWithQuest = this._npcsWithQuest.filter((n) => n !== r)
  }
  get_reason = () => this._reason
  public get reason() {
    return this._reason
  }
  public set reason(r: string) {
    this._reason = r
  }
  reset_caution() {
    this._caution = { ...nullCaution }
  }
  public get caution(): Caution {
    return this._caution
  }
  public set caution(c: Caution) {
    this._caution = { ...c }
  }
  public get item() {
    return this._item
  }
  public set item(i: string) {
    this._item = i
  }
  public get priority() {
    return this._priority
  }
  public set priority(p: boolean) {
    this._priority = p
  }
  public get active_quest() {
    return this._active_quest
  }
  public set active_quest(a: boolean) {
    this._active_quest = a
  }
  public get scripts(): string[] {
    return this._scripts
  }
  public set scripts(s: string[]) {
    this._scripts = s
  }
  public get npc(): NpcState {
    return this._npc
  }
  public set npc(npc: NpcState) {
    this.active_quest = this.npcsWithQuest.includes(npc.labelname)
    this._npc = npc
  }
  addScript(s: string) {
    this._scripts.push(s)
  }
  novelclose(love: number, alert: number, hp: number, reason: string) {
    msg.post('novel:/main#main', 'sleep', {
      love,
      alert,
      hp,
      reason,
    })
  }

  punch(hp: number) {
    //player.hp = player.hp - 1
    if (hp <= 0) {
      this.novelclose(this.npc.love, 0, 0, 'faint')
    }
  }
}
