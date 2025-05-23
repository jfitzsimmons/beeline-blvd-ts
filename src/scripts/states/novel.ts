import { NovelNpc } from '../../types/novel'
import { QuestMethods } from '../../types/tasks'
import { WorldArgs } from '../../types/world'
import { NpcsInitState } from './inits/npcsInitState'
import NpcState from './npc'

export default class WorldNovel {
  //private background: string
  //private sprites: { [key: string]: string }
  private _reason: string
  private _item: string
  cause: string
  private _active_quest: boolean
  private _forced: boolean
  private _npcsWithQuest: string[]
  private _scripts: string[]
  //private _alertChange: number
  private _npc: NovelNpc
  p: WorldArgs
  //private _quest: QuestCondition
  quests: QuestMethods

  constructor(novelMethods: WorldArgs) {
    // this.background = ''
    //  this.sprites = {}
    this._active_quest = false
    this._forced = false
    this._reason = 'none'
    this._item = 'none'
    this.cause = 'none'
    this._npcsWithQuest = []
    this._scripts = []
    // this._alertChange = 0
    this._npc = {
      sprites: { smile: '/assets/images/characters/eve/smile.png' },
      ...NpcsInitState.labor01,
    }
    this.p = novelMethods
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
      get_novel_item: this.get_novel_item.bind(this),
    }
    //Have something here like this.sprites.smile .laugh .sad etc....
    // set the sprites in the same function you set npc! TESTJPF
    this.append_npc_quest = this.append_npc_quest.bind(this)
    this.get_reason = this.get_reason.bind(this)
    this.getNovelUpdates = this.getNovelUpdates.bind(this)
    this.setConfrontation = this.setConfrontation.bind(this)
    this.get_novel_item = this.get_novel_item.bind(this)
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
  get_reason = () => {
    // print('get_reason = () => {', this._reason)
    return this._reason
  }
  public get reason() {
    return this._reason
  }
  public set reason(r: string) {
    this._reason = r
  }
  reset_novel() {
    this.forced = false
    this.reason = 'none'
    this.item = 'none'
    this.cause = 'none'
  }
  get_novel_item = () => {
    print(this._item, 'GETNOVELITEM!!!')
    return this._item
  }
  public get item() {
    return this._item
  }
  public set item(i: string) {
    this._item = i
  }
  public get forced() {
    return this._forced
  }
  public set forced(p: boolean) {
    this._forced = p
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
  public get npc(): NovelNpc {
    return this._npc
  }
  public set npc(n: NpcState) {
    this.active_quest = this.npcsWithQuest.includes(n.name)
    this._npc = {
      currStation: n.currStation,
      name: n.name,
      clan: n.clan,
      convos: n.convos,
      traits: n.traits,
      sincePlayerConvo: n.sincePlayerConvo,
      love: n.love,
      //sprites: { smile: `/assets/characters/${n.name}/smile.png` },//testjpf ,ay need to bace on race/ head
      sprites: { smile: '/assets/images/characters/eve/smile.png' },
    }
  }
  getNovelUpdates(): NovelNpc {
    return this.npc
  }
  setConfrontation(npc: string, action: string, reason: string) {
    this.npc = this.p.returnNpc(npc)
    this.reason = reason
    this.cause = action
    this._forced = true
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
