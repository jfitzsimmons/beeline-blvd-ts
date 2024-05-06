import { Npc } from '../../types/state'
import { QuestCondition, QuestMethods } from '../../types/tasks'

export default class WorldNovel {
  //private background: string
  //private sprites: { [key: string]: string }
  private _reason: string
  private _scripts: string[]
  //private _alertChange: number
  private _npc: Npc
  private _quest: QuestCondition
  quests: QuestMethods

  constructor(initnpc: Npc) {
    // this.background = ''
    //  this.sprites = {}
    this._reason = 'none'
    this._scripts = []
    // this._alertChange = 0
    this._npc = { ...initnpc }
    this._quest = {
      label: '',
      passed: false,
      interval: [],
      func: [() => false],
      args: [],
    }
    this.quests = {
      get_reason: () => this.reason,
    }
    //Have something here like this.sprites.smile .laugh .sad etc....
    // set the sprites in the same function you set npc! TESTJPF
  }
  public get quest() {
    return this._quest
  }
  public set quest(c: QuestCondition) {
    this._quest = c
  }
  public get reason() {
    return this._reason
  }
  public set reason(r: string) {
    this._reason = r
  }
  public get scripts(): string[] {
    return this._scripts
  }
  public set scripts(s: string[]) {
    this._scripts = s
  }
  public get npc(): Npc {
    return this._npc
  }
  public set npc(npc: Npc) {
    this._npc = { ...npc }
  }
  addScript(s: string) {
    this._scripts.push(s)
  }
  novelclose(love: number, alert: number, hp: number, reason: string) {
    print('novel.novel close love:', love, alert, hp, reason)
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
