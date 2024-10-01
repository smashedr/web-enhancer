// JS Background Service Worker

import {
    activateOrOpen,
    checkPerms,
    copyActiveElementText,
    injectFunction,
    openExtPanel,
    showHidePassword,
    githubURL,
} from './export.js'

chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.commands.onCommand.addListener(onCommand)
chrome.runtime.onMessage.addListener(onMessage)
chrome.storage.onChanged.addListener(onChanged)

/**
 * On Startup Callback
 * @function onStartup
 */
async function onStartup() {
    console.log('onStartup')
    // noinspection JSUnresolvedReference
    if (typeof browser !== 'undefined') {
        console.log('Firefox CTX Menu Workaround')
        const { options } = await chrome.storage.sync.get(['options'])
        console.debug('options:', options)
        if (options.ctx.enable) {
            createContextMenus(options.ctx)
        }
        await chrome.runtime.setUninstallURL(`${githubURL}/issues`)
    }
}

/**
 * On Installed Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const options = await setDefaultOptions({
        showPassword: true,
        hoverCopy: true,
        autoFocus: false,
        tabFocus: false,
        ctx: {
            enable: true,
            copy: true,
            password: true,
            options: true,
        },
        showUpdate: false,
    })

    console.debug('options:', options)
    if (options.ctx.enable) {
        createContextMenus(options.ctx)
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
        await openExtPanel()
    } else if (ctx.menuItemId === 'copyText') {
        console.debug('injectFunction: copy')
        await injectFunction(copyActiveElementText, [ctx])
    } else if (ctx.menuItemId === 'showPassword') {
        console.debug('showPassword')
        await injectFunction(showHidePassword)
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
        await openExtPanel()
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
    sendResponse('Success.')
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
async function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options' && oldValue && newValue) {
            if (JSON.stringify(oldValue.ctx) !== JSON.stringify(newValue.ctx)) {
                console.debug('%c CTX Change', 'color: Yellow')
                if (newValue.ctx.enable) {
                    console.log('%c Enabled contextMenus.', 'color: Lime')
                    createContextMenus(newValue.ctx)
                } else {
                    console.log('%c Disabled contextMenus.', 'color: Orange')
                    chrome.contextMenus?.removeAll()
                }
            }
        }
    }
}

/**
 * Create Context Menus
 * @function createContextMenus
 * @param {options.ctx} ctx
 */
function createContextMenus(ctx) {
    console.debug('%c createContextMenus:', 'color: OrangeRed', ctx)
    chrome.contextMenus.removeAll()
    // if (!options.ctxPassword && !options.ctxCopy && !options.ctxOptions) {
    //     return console.debug('No CTX Options Enabled')
    // }
    const collected = []
    if (ctx.password) {
        addContext([['editable'], 'showPassword', 'Show/Hide Password'])
        collected.push('editable')
    }
    if (ctx.copy) {
        addContext([['link'], 'copyText', 'Copy Link Text'])
        collected.push('link')
    }
    if (ctx.options) {
        if (ctx.password || ctx.copy) {
            console.debug('collected:', collected)
            addContext([collected, 'separator'])
        }
        addContext([['all'], 'openOptions', 'Open Options'])
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
 * Add Context from Array
 * @function addContext
 * @param {[chrome.contextMenus.ContextType[],String,String?,chrome.contextMenus.ContextItemType?]} context
 */
function addContext(context) {
    // console.debug('addContext:', context)
    try {
        if (context[1] === 'separator') {
            const id = Math.random().toString().substring(2, 7)
            context[1] = `${id}`
            context.push('separator', 'separator')
        }
        // console.debug('menus.create:', context)
        chrome.contextMenus.create({
            contexts: context[0],
            id: context[1],
            title: context[2],
            type: context[3] || 'normal',
        })
    } catch (e) {
        console.log('%cError Adding Context:', 'color: Yellow', e)
    }
}

/**
 * Set Default Options
 * @function setDefaultOptions
 * @param {Object} defaultOptions
 * @return {Promise<*|Object>}
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
        } else if (typeof defaultOptions[key] === 'object') {
            console.debug(`%cProcessing Object: ${key}`, 'color: Magenta')
            for (const [subKey, subValue] of Object.entries(
                defaultOptions[key]
            )) {
                if (options[key][subKey] === undefined) {
                    changed = true
                    options[key][subKey] = subValue
                    console.log(
                        `%cSet: ${key}.${subKey}:`,
                        'color: Lime',
                        subValue
                    )
                }
            }
        }
    }
    if (changed) {
        await chrome.storage.sync.set({ options })
        console.log('changed:', options)
    }
    return options
}
