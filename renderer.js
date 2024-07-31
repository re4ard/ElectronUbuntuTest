const { ipcRenderer } = require('electron');

document.getElementById('open-terminal').addEventListener('click', () => {
    ipcRenderer.send('open-terminal');
});
