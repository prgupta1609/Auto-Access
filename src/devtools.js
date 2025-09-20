// DevTools panel setup
chrome.devtools.panels.create(
  'AutoAccess',
  'icons/icon-48.png',
  'devtools.html',
  (panel) => {
    console.log('AutoAccess DevTools panel created');
  }
);
