interface props {
  currentProxy: url | null
}
interface url {
  fragment: hash
}

function show(curr_proxy: url | null, proxy: string) {
  if (curr_proxy != null) {
    msg.post('#', 'unload_pinball')
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
  if (messageId == hash('show_pinball')) {
    show(this.currentProxy, '#pinball00')
  } else if (messageId == hash('unload_pinball')) {
    if (this.currentProxy != null) {
      msg.post(this.currentProxy, 'disable')
      msg.post(this.currentProxy, 'final')
      msg.post(this.currentProxy, 'unload')
      this.currentProxy = null
    }
  } else if (messageId == hash('proxy_loaded')) {
    this.currentProxy = _sender
    /** 
    if (_sender.fragment == hash('pinball')) {
      msg.post('pinball:/main#main', 'wake_up')
    }
    **/
    msg.post(this.currentProxy, 'enable')

    //msg.post('.', 'release_input_focus')
    //msg.post('.', 'acquire_input_focus')
  }
}
