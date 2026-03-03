const { app, BrowserWindow, Menu } = require("electron")

function createWindow() {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        minWidth: 1200,
        minHeight: 800,
    })

    win.maximize()
    win.loadURL("http://localhost:3000")

    Menu.setApplicationMenu(null)
}

app.whenReady().then(createWindow)