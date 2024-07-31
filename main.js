const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const { exec } = require('child_process');
const path = require('path');

let mainWindow, loadingScreen;
let terminalOpen = false;

function createLoadingScreen() {
  loadingScreen = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  loadingScreen.loadURL(`file://${path.join(__dirname, 'loading.html')}`);
  loadingScreen.on('closed', () => (loadingScreen = null));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  mainWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`);
  mainWindow.once('ready-to-show', () => {
    if (loadingScreen) {
      loadingScreen.close();
    }
    mainWindow.show();
    disableAllKeys();
  });
  mainWindow.on('closed', () => (mainWindow = null));
}

function disableAllKeys() {
  globalShortcut.registerAll(['CommandOrControl+A', 'CommandOrControl+C', 'CommandOrControl+V', 'CommandOrControl+X', 'CommandOrControl+Z', 'CommandOrControl+Y'], () => {
    return !terminalOpen;
  });
}

function enableAllKeys() {
  globalShortcut.unregisterAll();
}

app.on('ready', () => {
  createLoadingScreen();
  createMainWindow();
});

ipcMain.on('open-terminal', (event) => {
  terminalOpen = true;
  enableAllKeys();
  const terminalCommand = `gnome-terminal --geometry=80x24+640+360`;
  exec(terminalCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening terminal: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    // Once the terminal is closed, re-disable all keys
    terminalOpen = false;
    disableAllKeys();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
