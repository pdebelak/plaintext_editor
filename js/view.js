(function(global) {
  'use strict';
  const tabNames = ['Side by Side', 'Focused Mode', 'Preview', 'HTML'];

  const View = class {
    constructor() {
      this.page = document.querySelector('main');
    }

    render() {
      var container = document.createElement('div');
      this.page.appendChild(container);
      container.classList.add('container');
      var fileArea = new FileArea(container);
      fileArea.render();
      var tabs = new Tabs(container);
      tabs.render();
      var section = document.createElement('section');
      container.appendChild(section);
      section.classList.add('tab-content');
      var content = new Content(section);
      content.render();
    }
  }

  const FileArea = class {
    constructor(container) {
      this.container = container;
      this.fileNameContainer = null;
      this.openFileButton = null;
      this.saveFileButton = null;
      this.newFileButton = null;
      this.listenForFileNameChange();
    }

    displayFileName(fileName) {
      this.fileNameContainer.innerHTML = '';
      var text = document.createTextNode(fileName);
      if(this.fileNameContainer) {
        this.fileNameContainer.appendChild(text);
      }
    }

    listenForFileNameChange() {
      document.addEventListener('file:changed', (event) => {
        this.displayFileName(event.detail);
      });
    }

    listenForClicks() {
      this.openFileButton.addEventListener('click', () => {
        var event = new Event('file:shouldOpen');
        document.dispatchEvent(event);
      });
      this.saveFileButton.addEventListener('click', () => {
        var event = new Event('file:shouldSave');
        document.dispatchEvent(event);
      });
      this.newFileButton.addEventListener('click', () => {
        var event = new Event('file:new');
        document.dispatchEvent(event);
      });
    }


    render() {
      var div = document.createElement('div');
      this.container.appendChild(div);
      div.classList.add('button-container');
      this.fileNameContainer = document.createElement('p');
      div.appendChild(this.fileNameContainer);
      this.fileNameContainer.classList.add('file-name');
      this.displayFileName();
      this.openFileButton = document.createElement('button');
      this.container.appendChild(this.openFileButton);
      var openFileText = document.createTextNode('Open File');
      this.openFileButton.appendChild(openFileText);
      this.saveFileButton = document.createElement('button');
      this.container.appendChild(this.saveFileButton);
      var saveFileText = document.createTextNode('Save File');
      this.saveFileButton.appendChild(saveFileText);
      this.newFileButton = document.createElement('button');
      this.container.appendChild(this.newFileButton);
      var newFileText = document.createTextNode('New File');
      this.newFileButton.appendChild(newFileText);
      this.listenForClicks();
    }
  }

  const Tabs = class {
    constructor(container) {
      this.container = container;
      this.active = tabNames[0];
      this.tabs = [];
    }

    setActive(tabName) {
      this.active = tabName;
      var event = new CustomEvent('tab:activate', { detail: this.active });
      document.dispatchEvent(event);
    }

    handleTabClick() {
      var _this = this;
      return function(clickedTab) {
        _this.setActive(clickedTab.name);
        _this.tabs.forEach(function(tab) {
          tab.active = _this.active;
          tab.setActive();
        });
      }
    }

    render() {
      var nav = document.createElement('nav');
      this.container.appendChild(nav);
      var tabs = document.createElement('ul');
      nav.appendChild(tabs);
      tabs.classList.add('tabs');
      for(var i=0;i<tabNames.length;i++) {
        var tab = new Tab(tabs, tabNames[i], this.active, this.handleTabClick());
        this.tabs.push(tab);
        tab.render();
      }
    }
  }

  const Tab = class {
    constructor(list, name, active, clickHandler) {
      this.list = list;
      this.name = name;
      this.active = active;
      this.clickHandler = clickHandler;
      this.element = document.createElement('li');
    }

    addClickHandler() {
      this.element.addEventListener('click', (e) => {
        this.clickHandler(this);
      });
    }

    setActive() {
      if (this.name === this.active) {
        this.element.classList.add('active');
      } else {
        this.element.classList.remove('active');
      }
    }

    render() {
      this.list.appendChild(this.element);
      var link = document.createElement('a');
      this.element.appendChild(link);
      link.href = `#${this.name}`;
      var text = document.createTextNode(this.name);
      link.appendChild(text);
      this.addClickHandler();
      this.setActive();
    }
  }

  const Content = class {
    constructor(container) {
      this.container = container;
      this.active = tabNames[0];
      this.listenForActiveChange();
      this.listenForFileChange();
    }

    listenForActiveChange() {
      document.addEventListener('tab:activate', (event) => {
        this.active = event.detail;
        this.render();
      });
    }

    listenForFileChange() {
      document.addEventListener('file:changed', (e) => {
        this.render();
      });
    }

    addEditor(element) {
      var div = document.createElement('div');
      div.id = global.editorId;
      element.appendChild(div);
      var event = new Event('editor:added');
      document.dispatchEvent(event);
    }

    render() {
      this.container.innerHTML = '';
      if (this.active === tabNames[0]) {
        this.renderFirst();
      } else if (this.active === tabNames[1]) {
        this.renderSecond();
      } else if (this.active === tabNames[2]) {
        this.renderThird();
      } else if (this.active === tabNames[3]) {
        this.renderFourth();
      }
    }

    renderFirst() {
      var row = document.createElement('div');
      this.container.appendChild(row);
      row.classList.add('row');
      var col1 = document.createElement('div');
      col1.classList.add('col');
      col1.classList.add('half');
      var col2 = document.createElement('div');
      col2.classList.add('col');
      col2.classList.add('half');
      col2.id = global.realtimeOuputId;
      col2.innerHTML = global.editor.getMarkdown();
      row.appendChild(col1);
      row.appendChild(col2);
      this.addEditor(col1);
    }

    renderSecond() {
      this.addEditor(this.container);
    }

    renderThird() {
      this.container.innerHTML = global.editor.getMarkdown();
    }

    renderFourth() {
      var pre = document.createElement('pre');
      this.container.appendChild(pre);
      var text = document.createTextNode(global.editor.getMarkdown());
      pre.appendChild(text);
    }
  }

  const view = new View();
  view.render();
})(window);
