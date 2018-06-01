import log from './logger';
import Constants from './constants';

// Usually, a store is backed by some server side persistence.
// In a bizarre, highly unconventional twist, this store is backed by HipChat's own DOM elements.
// CornChat is a client _of the hipchat DOM_, so the hipchat DOM is the "store".
let _instance = null;
class MsgElementsStore {
  constructor() {
    if (!_instance) {
      _instance = this;
      this.elements = [];
      this.listeners = [];
      this._watch();
    }
    return _instance;
  }

  // Returns most recently fetched HipChat msg DOM elements in the form:
  //  [{msgEl: msg, msgId: msgId}, ...]
  recentElements() {
    return this.elements;
  }

  // Listen for onElementsChanged(prevElements, currentElements)
  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(item => item !== listener);
  }

  _onElementsChanged(prevElements, currentElements) {
    this.listeners.forEach((listener) => {
      listener.onElementsChanged(prevElements, currentElements);
    });
  }

  // Main HipChat DOM watch loop
  _watch() {
    log("MsgElementsStore: Starting HipChat DOM watch loop");
    const watchLoop = () => {
      let current = this._fetchCurrentElements();
      let existing = this.elements;
      let isSame = (
        current.length == existing.length &&
        current.every((v,i)=> {
          return v.msgEl === existing[i].msgEl &&
            v.msgId === existing[i].msgId;
        })
      );
      if (!isSame) {
        log("HipChat DOM updated");
        this.elements = current;
        this._onElementsChanged(existing, current);
      }
    }
    watchLoop();
    setInterval(watchLoop, Constants.msg_elements_dom_watch_interval);
  }

  _fetchCurrentElements() {
    let currentElements = [];
    const msgs = $('div.actionable-msg-container');
    _.each(msgs, (msg, key) => {
      const msgLineDiv = $(msg).find('div.msg-line');
      const hasMsgLineDiv = msgLineDiv.length;
      if (hasMsgLineDiv) {
        const msgId = $(msgLineDiv).data('mid');
        // When HipChat first adds a message element into the DOM,
        // its data-mid attribute is a number (e.g. 0, 1, 2, ...),
        // not a UUID. After a few seconds, HipChat converts this
        // number to a string that looks like a UUID.
        // Wait until we have a UUID.
        if (isNaN(msgId)) {
          currentElements.push({msgEl: msg, msgId: msgId});
        }
      }
    });
    return currentElements;
  }
}

export default MsgElementsStore;
