(function(global) {
  'use strict';

  const Editor = class {
    constructor() {
      this.editor = null;
      this.markdown = '';
      this.listen();
    }

    listen() {
      document.addEventListener('editor:added', (e) => {
        this.initiateEditor(e.detail);
      });
      document.addEventListener('file:new', (e) => {
        this.reset();
      });
      document.addEventListener('file:saved', (e) => {
        e.detail(this.contents());
        this.storeMarkdown();
      });
      document.addEventListener('file:opened', (e) => {
        this.setMarkdown(e.detail);
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
      value = value || this.markdown;
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

    initiateEditor(editorId) {
      if(!document.getElementById(editorId)) { return; }

      this.editor = ace.edit(editorId);
      this.editor.$blockScrolling = Infinity;
      this.editor.setTheme('ace/theme/xcode');
      this.editor.setKeyboardHandler('ace/keyboard/vim');
      this.editor.getSession().setMode('ace/mode/markdown');
      this.editor.getSession().setUseWrapMode(true);
      this.editor.getSession().setTabSize(2);
      this.editor.getSession().on('change', (e) => {
        this.storeMarkdown();
        var event = new CustomEvent('editor:updated', { detail: this.getMarkdown() });
        document.dispatchEvent(event);
        this.storeMarkdown();
      });
      this.setValues();
    }
  }

  const editor = new Editor();

  global.getMarkdown = function() {
    return editor.getMarkdown();
  }

  chrome.storage.local.get(['markdown'], (result) => {
    editor.setMarkdown(result.markdown);
  });
})(window);
