(function(global){
  'use strict';

  const newFileText = '*new file*';

  const FileManager = class {
    constructor() {
      this.chosenFile = null;
      this.fileName = newFileText;
      this.addEventListeners();
    }

    addEventListeners() {
      document.addEventListener('file:shouldOpen', () => {
        this.openFile();
      });
      document.addEventListener('file:shouldSave', () => {
        this.saveFile();
      });
      document.addEventListener('file:new', () => {
        this.newFile();
      });
    }

    loadFileFromId(id) {
      if (!id) { return; }

      chrome.fileSystem.restoreEntry(id, (entry) => {
        this.chosenFile = entry;
        this.setName();
      });
    }

    setName() {
      if (this.chosenFile) {
        chrome.fileSystem.getDisplayPath(this.chosenFile, (displayPath) => {
          this.fileName = displayPath;
          var event = new CustomEvent('file:changed', { detail: this.fileName });
          document.dispatchEvent(event);
        });
      } else {
        this.fileName = newFileText;
        var event = new CustomEvent('file:changed', { detail: this.fileName });
        document.dispatchEvent(event);
      }
    }

    openFile() {
      chrome.fileSystem.chooseEntry({type: 'openFile'}, (readOnlyEntry) => {

        this.storeFileInfo(readOnlyEntry);
        chrome.storage.local.set({ chosenFile: chrome.fileSystem.retainEntry(this.chosenFile) });
        readOnlyEntry.file((file) => {
          var reader = new FileReader();

          reader.onloadend = (e) => {
            var event = new CustomEvent('file:opened', { detail: e.target.result });
            document.dispatchEvent(event);
          };

          reader.readAsText(file);
        });
      });
    }

    saveFile() {
      if (this.chosenFile) {
        chrome.fileSystem.getWritableEntry(this.chosenFile, (writableFileEntry) => {
          writableFileEntry.createWriter((writer) => {
            this.chosenFile.file((file) => {
              this.replaceFileContents(writer);
            });
          });
        });
      } else {
        chrome.fileSystem.chooseEntry({type: 'saveFile'}, (writableFileEntry) => {
          this.storeFileInfo(writableFileEntry);
          writableFileEntry.createWriter((writer) => {
            this.replaceFileContents(writer);
          });
        });
      }
    }

    storeFileInfo(entry) {
      this.chosenFile = entry;
      this.setName();
    }

    newFile() {
      chrome.storage.local.set({ chosenFile: null });
      this.storeFileInfo(null);
    }

    replaceFileContents(writer) {
      writer.onwriteend = () => {
        if (writer.length === 0) {
          var event = new CustomEvent('file:saved', { detail: function(contents) { writer.write(new Blob([contents], {type: 'text/plain'})); } });
          document.dispatchEvent(event);
        }
      }
      writer.truncate(0);
    }
  }

  const fileManager = new FileManager();

  chrome.storage.local.get(['chosenFile'], (result) => {
    fileManager.loadFileFromId(result.chosenFile);
    fileManager.setName();
  });
})(window);
