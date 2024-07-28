interface props {
  current_proxy: url | null
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
  this.current_proxy = null
}

export function on_message(
  this: props,
  messageId: hash,
  _message: unknown,
  _sender: url
): void {
  if (messageId == hash('show_pinball')) {
    show(this.current_proxy, '#pinball00')
  } else if (messageId == hash('unload_pinball')) {
    if (this.current_proxy != null) {
      msg.post(this.current_proxy, 'disable')
      msg.post(this.current_proxy, 'final')
      msg.post(this.current_proxy, 'unload')
      this.current_proxy = null
    }
  } else if (messageId == hash('proxy_loaded')) {
    this.current_proxy = _sender
    /** 
    if (_sender.fragment == hash('pinball')) {
      msg.post('pinball:/main#main', 'wake_up')
    }
    **/
    msg.post(this.current_proxy, 'enable')

    //msg.post('.', 'release_input_focus')
    //msg.post('.', 'acquire_input_focus')
  }
}
