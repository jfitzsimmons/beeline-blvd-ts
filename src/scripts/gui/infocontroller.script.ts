interface props {
  currentProxy: url | null
}
interface url {
  fragment: hash
}

function show(curr_proxy: url | null, proxy: string) {
  if (curr_proxy != null) {
    msg.post('#', 'unload_info')
  } else {
    msg.post(proxy, 'async_load')
  }
}

export function init(this: props) {
  this.currentProxy = null
}

export function on_message(
  this: props,
  messageId: hash,
  _message: unknown,
  _sender: url
): void {
  if (messageId == hash('toggle_info')) {
    show(this.currentProxy, '#info_gui')
  } else if (messageId == hash('unload_info')) {
    if (this.currentProxy != null) {
      msg.post(this.currentProxy, 'disable')
      msg.post(this.currentProxy, 'final')
      msg.post(this.currentProxy, 'unload')
      this.currentProxy = null
    }
  } else if (messageId == hash('proxy_loaded')) {
    this.currentProxy = _sender

    if (_sender.fragment == hash('info_gui')) {
      msg.post('info_gui:/info_main#info_main', 'wake_up')
    }
    msg.post(this.currentProxy, 'enable')
  }
}
