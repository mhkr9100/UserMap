// electron/preload.js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Add any secure bindings here if you need Node.js access from the React app
  isDesktop: true
});
