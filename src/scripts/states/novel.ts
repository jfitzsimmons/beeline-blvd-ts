/**
 * import { PlayerState, Skills, QuestMethods } from '../../types/state'
import { PlayerInitState } from './inits/playerInitState'

function random_skills(skills: Skills) {
  const tempvals: number[] = shuffle([1, 1, 3, 4, 5, 6, 6, 7])
  let count = 0
  let ks: keyof typeof skills // Type is "one" | "two" | "three"
  for (ks in skills) {
    skills[ks] = tempvals[count] + math.random(-1, 1)
    count++
  }
}**/

import { Npc } from '../../types/state'

export default class WorldNovel {
  private background: string
  private sprites: { [key: string]: string }
  private _reason: string
  private _scripts: string[]
  private _alertChange: number
  private _npc: Npc

  constructor(initnpc: Npc) {
    this.background = ''
    this.sprites = {}
    this._reason = ''
    this._scripts = []
    this._alertChange = 0
    this._npc = { ...initnpc }
    //Have something here like this.sprites.smile .laugh .sad etc....
    // set the sprites in the same function you set npc! TESTJPF
    /** 
    this._state = { ...PlayerInitState }
    random_skills(this._state.skills)
    this.quests = {
      return_inventory: this.return_inventory.bind(this),
      return_skills: this.return_skills.bind(this),
      increase_alert_level: this.increase_alert_level.bind(this),
    }**/
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
    //Object.assign(this._npc, npc)
    this._npc = { ...npc }
  }
  public get alertChange() {
    return this._alertChange
  }
  public set alertChange(n: number) {
    this._alertChange = n
  }
  addScript(s: string) {
    this._scripts.push(s)
  }
  load_novel() {
    /**
     * set background, sprites, script, etcc
     * testjpf
     */
    msg.post('novel:/main#main', 'wake_up', {})
  }
  //make arrest generic string TESTJPF??
  //cause: "none", "irritated", "arrested",...
  novelclose(love: number, alert: number, hp: number, cause: string) {
    //testjpf in txt files, need to pass arrested as string, not boolean
    print('novel.novel close love:', love, alert, hp, cause)
    msg.post('novel:/main#main', 'sleep', {
      love,
      alert,
      hp,
      cause,
    })
  }

  punch(hp: number) {
    //player.hp = player.hp - 1
    if (hp <= 0) {
      this.novelclose(this.npc.love, 0, 0, 'faint')
    }
  }
}
