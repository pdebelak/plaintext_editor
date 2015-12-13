(function(global) {
  'use strict';

  global.editorId = 'editor';
  global.realtimeOuputId = 'realtime-output';

  const Editor = class {
    constructor() {
      this.editor = null;
      this.markdown = '';
      this.listen();
    }

    listen() {
      document.addEventListener('editor:added', (e) => {
        this.initiateEditor();
      });
    }

    storeMarkdown() {
      if(this.editor) {
        this.markdown = this.editor.getValue();
        if(chrome) {
          chrome.storage.local.set({ markdown: this.markdown });
        }
      }
    }

    setValues(value) {
      if(!this.editor) { return; }
      if(typeof value === "undefined") { value = this.markdown; }
      this.editor.setValue(value);
      this.editor.clearSelection(1);
      this.editor.focus();
    }

    contents() {
      return this.editor.getValue();
    }

    getMarkdown() {
      return marked(this.markdown);
    }

    reset() {
      this.markdown = '';
      this.setValues('');
    }

    setMarkdown(val) {
      this.markdown = val || '';
      this.setValues();
    }

    initiateEditor() {
      if(!document.getElementById('editor')) { return; }

      this.editor = ace.edit(editorId);
      this.editor.$blockScrolling = Infinity;
      this.editor.setTheme('ace/theme/xcode');
      this.editor.setKeyboardHandler('ace/keyboard/vim');
      this.setValues();
      this.editor.getSession().setMode('ace/mode/markdown');
      this.editor.getSession().setUseWrapMode(true);
      this.editor.getSession().on('change', (e) => {
        var realtimeOutput = document.getElementById(realtimeOuputId);
        this.storeMarkdown();
        if(realtimeOutput) {
          realtimeOutput.innerHTML = this.getMarkdown();
        }
      });
    }
  }

  global.editor = new Editor();

  chrome.storage.local.get(['markdown'], (result) => {
    editor.setMarkdown(result.markdown);
  });
})(window);
