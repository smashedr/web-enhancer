// JS Background Service Worker

import {
    activateOrOpen,
    checkPerms,
    copyActiveElementText,
    injectFunction,
    sendNotification,
    showHidePassword,
} from './export.js'

chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.commands.onCommand.addListener(onCommand)
chrome.runtime.onMessage.addListener(onMessage)
chrome.storage.onChanged.addListener(onChanged)
chrome.notifications.onClicked.addListener(notificationsClicked)

const nativeApp = 'org.cssnr.hls.downloader'

/**
 * On Startup Callback
 * @function onStartup
 */
async function onStartup() {
    console.log('onStartup')
    if (typeof browser !== 'undefined') {
        console.log('Firefox CTX Menu Workaround')
        const { options } = await chrome.storage.sync.get(['options'])
        console.debug('options:', options)
        if (options.contextMenu) {
            createContextMenus(options)
        }
    }
}

/**
 * On Installed Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const githubURL = 'https://github.com/cssnr/web-enhancer'
    const options = await Promise.resolve(
        setDefaultOptions({
            showPassword: true,
            hoverCopy: true,
            autoFocus: false,
            contextMenu: true,
            ctxPage: true,
            ctxLink: true,
            ctxPassword: true,
            ctxCopy: true,
            ctxOptions: false,
            showUpdate: false,
        })
    )
    console.debug('options:', options)
    if (options.contextMenu) {
        createContextMenus(options)
    }
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const hasPerms = await checkPerms()
        if (hasPerms) {
            chrome.runtime.openOptionsPage()
        } else {
            const url = chrome.runtime.getURL('/html/permissions.html')
            await chrome.tabs.create({ active: true, url })
        }
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        if (options.showUpdate) {
            const manifest = chrome.runtime.getManifest()
            if (manifest.version !== details.previousVersion) {
                const url = `${githubURL}/releases/tag/${manifest.version}`
                await chrome.tabs.create({ active: false, url })
            }
        }
    }
    await chrome.runtime.setUninstallURL(`${githubURL}/issues`)
}

/**
 * On Clicked Callback
 * @function onClicked
 * @param {OnClickData} ctx
 * @param {chrome.tabs.Tab} tab
 */
async function onClicked(ctx, tab) {
    console.debug('onClicked:', ctx, tab)
    if (ctx.menuItemId === 'openOptions') {
        chrome.runtime.openOptionsPage()
    } else if (ctx.menuItemId === 'openHome') {
        const url = chrome.runtime.getURL('/html/home.html')
        await activateOrOpen(url)
    } else if (ctx.menuItemId === 'showPanel') {
        await chrome.windows.create({
            type: 'panel',
            url: '/html/panel.html',
            width: 720,
            height: 480,
        })
    } else if (ctx.menuItemId === 'copyText') {
        console.debug('injectFunction: copy')
        await injectFunction(copyActiveElementText, [ctx])
    } else if (ctx.menuItemId === 'showPassword') {
        console.debug('showPassword')
        await injectFunction(showHidePassword)
    } else if (ctx.menuItemId === 'processUrl') {
        console.debug('processUrl')
        await processUrl(ctx.pageUrl)
    } else if (ctx.menuItemId === 'processVideo') {
        console.debug('processVideo')
        await processUrl(ctx.linkUrl)
    } else {
        console.error(`Unknown ctx.menuItemId: ${ctx.menuItemId}`)
    }
}

/**
 * On Command Callback
 * @function onCommand
 * @param {String} command
 */
async function onCommand(command) {
    console.debug(`onCommand: ${command}`)
    if (command === 'openHome') {
        const url = chrome.runtime.getURL('/html/home.html')
        await activateOrOpen(url)
    } else if (command === 'showPanel') {
        await chrome.windows.create({
            type: 'panel',
            url: '/html/panel.html',
            width: 480,
            height: 360,
        })
    }
}

/**
 * On Message Callback
 * @function onMessage
 * @param {Object} message
 * @param {MessageSender} sender
 * @param {Function} sendResponse
 */
function onMessage(message, sender, sendResponse) {
    console.debug('onMessage: message, sender:', message, sender)
    if (message.sendNative) {
        const msg = message.sendNative
        chrome.runtime.sendNativeMessage(nativeApp, msg).then((response) => {
            console.log('response:', response)
            sendNotification('Download Complete.', response.path, response.path)
        })
    }
    if (message.download) {
        console.log('message.download:', message.download)
        try {
            chrome.downloads.download(message.download)
        } catch (e) {
            // this throws an error if the user cancels the download
            console.log(e)
        }
    }
    sendResponse('Success.')
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    // console.debug('onChanged:', changes, namespace)
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options' && oldValue && newValue) {
            if (oldValue.contextMenu !== newValue.contextMenu) {
                if (newValue?.contextMenu) {
                    console.info('Enabled contextMenu...')
                    createContextMenus(newValue)
                } else {
                    console.info('Disabled contextMenu...')
                    chrome.contextMenus.removeAll()
                }
            } else if (newValue.contextMenu) {
                createContextMenus(newValue)
            }
        }
    }
}

/**
 * Notifications On Clicked Callback
 * @function notificationsClicked
 * @param {String} notificationId
 */
async function notificationsClicked(notificationId) {
    console.debug('notifications.onClicked:', notificationId)
    chrome.notifications.clear(notificationId)
    if (!isNaN(parseInt(notificationId))) {
        return console.log('normal notification')
    }
    const message = { open: notificationId }
    console.log('message:', message)
    try {
        const response = await chrome.runtime.sendNativeMessage(
            nativeApp,
            message
        )
        console.log('response:', response)
    } catch (e) {
        console.log(e)
    }
}

/**
 * Create Context Menus
 * @function createContextMenus
 */
function createContextMenus(options) {
    console.debug('createContextMenus')
    chrome.contextMenus.removeAll()
    // if (!options.ctxPassword && !options.ctxCopy && !options.ctxOptions) {
    //     return console.debug('No CTX Options Enabled')
    // }
    if (options.ctxPassword) {
        addContext([['editable'], 'showPassword', '', 'Show/Hide Password'])
    }
    if (options.ctxCopy) {
        addContext([['link'], 'copyText', '', 'Copy Link Text'])
    }
    // addContext('all')
    if (options.ctxLink) {
        addContext([['link'], 'processVideo', '', 'Process Link'])
    }
    if (options.ctxPage) {
        addContext([['page'], 'processUrl', '', 'Process Page URL'])
    }
    if (options.ctxOptions) {
        if (
            options.ctxPassword ||
            options.ctxCopy ||
            options.ctxLink ||
            options.ctxPage
        ) {
            addContext('all')
        }
        addContext([['all'], 'openOptions', '', 'Open Options'])
    }

    // const contexts = [
    //     // 'all',
    //     // [['all'], 'openHome', 'normal', 'Home Page'],
    //     // [['all'], 'showPanel', 'normal', 'Extension Panel'],
    // ]
    // contexts.forEach((context) => {
    //     addContext(context)
    // })
}

/**
 * Add Context from Array or Separator from String
 * @function addContext
 * @param {Array,String} context
 */
function addContext(context) {
    if (typeof context === 'string') {
        const id = Math.random().toString().substring(2, 7)
        context = [[context], id, 'separator', 'separator']
    }
    // console.debug('menus.create:', context)
    chrome.contextMenus.create({
        contexts: context[0],
        id: context[1],
        type: context[2] || 'normal',
        title: context[3],
    })
}

/**
 * Set Default Options
 * @function setDefaultOptions
 * @param {Object} defaultOptions
 * @return {Object}
 */
async function setDefaultOptions(defaultOptions) {
    console.log('setDefaultOptions', defaultOptions)
    let { options } = await chrome.storage.sync.get(['options'])
    options = options || {}
    let changed = false
    for (const [key, value] of Object.entries(defaultOptions)) {
        // console.log(`${key}: default: ${value} current: ${options[key]}`)
        if (options[key] === undefined) {
            changed = true
            options[key] = value
            console.log(`Set ${key}:`, value)
        }
    }
    if (changed) {
        await chrome.storage.sync.set({ options })
        console.log('changed:', options)
    }
    return options
}

async function processUrl(url) {
    console.debug('processUrl:', url)
    if (url.startsWith('https://www.youtube.com/')) {
        await processYoutube(url)
    } else {
        console.info('No Actions Defined for URL:', url)
        await sendNotification('Unknown URL.', `No Actions for: ${url}`)
    }
}

async function processYoutube(url) {
    console.debug('processYoutube:', url)
    // if (!(await testNativeMessage(null, 'error'))) {
    //     return
    // }
    const msg = { youtube: url }
    chrome.runtime.sendNativeMessage(nativeApp, msg).then((response) => {
        console.log('response:', response)
        if (response.success) {
            sendNotification('Download Complete.', response.path, response.path)
        } else {
            sendNotification('Download Error.', response.message)
        }
    })
    // await sendNotification('Download Started.', url)
}
