(function(global){
  'use strict';

  const newFileText = '*new file*';

  const FileManager = class {
    constructor() {
      this.chosenFile = null;
      this.fileName = newFileText;
    }

    loadFileFromId(id) {
      if (!id || !chrome) { return; }

      chrome.fileSystem.restoreEntry(id, (entry) => {
        this.chosenFile = entry;
      });
      this.setName();
    }

    setName() {
      var event = new Event('file:changed');
      if (this.chosenFile) {
        chrome.fileSystem.getDisplayPath(this.chosenFile, (displayPath) => {
          this.fileName = displayPath;
          document.dispatchEvent(event);
        });
      } else {
        this.fileName = newFileText;
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
            global.editor.setMarkdown(e.target.result);
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
      global.editor.reset();
      chrome.storage.local.set({ chosenFile: null });
      this.storeFileInfo(null);
    }

    replaceFileContents(writer) {
      writer.onwriteend = () => {
        if (writer.length === 0) {
          writer.write(new Blob([global.editor.contents()], {type: 'text/plain'}));
          global.editor.storeMarkdown();
        }
      }
      writer.truncate(0);
    }
  }

  global.fileManager = new FileManager();
})(window);
