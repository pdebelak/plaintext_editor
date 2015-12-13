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
      var alerts = new Alerts(container);
      alerts.render();
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

  const Alerts = class {
    constructor(container) {
      this.container = container;
      this.alertBox = null;
      this.listen();
    }

    displayAlert(alert, status) {
      this.alertBox.classList.remove('removed');
      this.alertBox.classList.remove('success');
      this.alertBox.classList.remove('error');
      this.alertBox.innerHTML = '';
      var text = document.createTextNode(alert);
      this.alertBox.appendChild(text);
      this.alertBox.classList.add(status);
      global.setTimeout(() => {
        this.alertBox.classList.add('removed');
      }, 2000);
    }

    listen() {
      document.addEventListener('file:saved', (e) => {
        console.log('saved!');
        this.displayAlert('File saved!', 'success');
      });
      document.addEventListener('file:saveError', (e) => {
        this.displayAlert('File could not be saved', 'error');
      });
      document.addEventListener('file:openError', (e) => {
        this.displayAlert('File was not opened', 'error');
      });
    }

    render() {
      this.alertBox = document.createElement('div');
      this.alertBox.classList.add('alert');
      this.container.appendChild(this.alertBox);
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

    renderFileName(container) {
      this.fileNameContainer = document.createElement('p');
      container.appendChild(this.fileNameContainer);
      this.fileNameContainer.classList.add('file-name');
      this.displayFileName();
    }

    createButton(text) {
      var button = document.createElement('button');
      this.container.appendChild(button);
      var textNode = document.createTextNode(text);
      button.appendChild(textNode);
      return button;
    }

    render() {
      var div = document.createElement('div');
      this.container.appendChild(div);
      div.classList.add('button-container');
      this.renderFileName(div);
      this.openFileButton = this.createButton('Open File');
      this.saveFileButton = this.createButton('Save File');
      this.newFileButton = this.createButton('New File');
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
      var editorId = 'editor';
      div.id = editorId;
      element.appendChild(div);
      var event = new CustomEvent('editor:added', { detail: editorId });
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

    createCol(row) {
      var col = document.createElement('div');
      col.classList.add('col');
      col.classList.add('half');
      row.appendChild(col);
      return col;
    }

    renderFirst() {
      var row = document.createElement('div');
      this.container.appendChild(row);
      row.classList.add('row');
      var col1 = this.createCol(row);
      var col2 = this.createCol(row);
      document.addEventListener('editor:updated', function(event) {
        col2.innerHTML = event.detail;
      });
      this.addEditor(col1);
    }

    renderSecond() {
      this.addEditor(this.container);
    }

    renderThird() {
      this.container.innerHTML = global.getMarkdown();
    }

    renderFourth() {
      var pre = document.createElement('pre');
      this.container.appendChild(pre);
      var text = document.createTextNode(global.getMarkdown());
      pre.appendChild(text);
    }
  }

  const view = new View();
  view.render();
})(window);
