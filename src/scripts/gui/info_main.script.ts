const { player } = globalThis.game.world

interface props {
  npcname: string
  cause: string
}

export function on_message(
  this: props,
  messageId: hash,
  //message: {},
  _sender: url
): void {
  if (messageId == hash('wake_up')) {
    // print('INFO LOADED AND WOKEN UP')
  } else if (messageId == hash('sleep')) {
    msg.post('proxies:/controller#infocontroller', 'unload_info')
    msg.post(player.currRoom + ':/shared/scripts#level', 'exit_gui')
  }
}
