function openWindow() {
  var defaults = {
    width: 800,
    height: 600,
    left: 50,
    top: 50
  }
  chrome.app.window.create('index.html', {
    id: 'plaintext-editor',
    innerBounds: defaults
  });
}

chrome.app.runtime.onLaunched.addListener(openWindow);
