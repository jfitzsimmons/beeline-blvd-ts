interface props {
  current_proxy: url | null
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
  this.current_proxy = null
}

export function on_message(
  this: props,
  messageId: hash,
  _message: unknown,
  _sender: url
): void {
  if (messageId == hash('toggle_info')) {
    show(this.current_proxy, '#info_gui')
  } else if (messageId == hash('unload_info')) {
    if (this.current_proxy != null) {
      msg.post(this.current_proxy, 'disable')
      msg.post(this.current_proxy, 'final')
      msg.post(this.current_proxy, 'unload')
      this.current_proxy = null
    }
  } else if (messageId == hash('proxy_loaded')) {
    this.current_proxy = _sender

    if (_sender.fragment == hash('info_gui')) {
      msg.post('info_gui:/info_main#info_main', 'wake_up')
    }
    msg.post(this.current_proxy, 'enable')
  }
}
