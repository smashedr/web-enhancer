// JS for popup.html

import {
    checkPerms,
    linkClick,
    grantPerms,
    saveOptions,
    showToast,
    updateOptions,
    updateManifest,
} from './export.js'

chrome.storage.onChanged.addListener(onChanged)

document.addEventListener('DOMContentLoaded', initPopup)
document
    .querySelectorAll('.grant-permissions')
    .forEach((el) => el.addEventListener('click', (e) => grantPerms(e, true)))
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', (e) => linkClick(e, true)))
document
    .querySelectorAll('#options-form input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    // noinspection ES6MissingAwait
    updateManifest()
    checkPerms().then((hasPerms) => {
        if (!hasPerms) {
            console.log('%c Host Permissions Not Granted', 'color: Red')
        }
    })

    chrome.storage.sync.get(['options']).then((items) => {
        console.debug('options:', items.options)
        updateOptions(items.options)
    })

    // This blok of code should be updated...
    const host = document.getElementById('host-div')
    const [tab, url] = await checkTab()
    console.debug('tab, url:', tab, url)
    if (!tab || !url) {
        host.classList.add('border-danger-subtle')
        return
    }
    host.querySelector('kbd').textContent = url.hostname
    host.classList.add('border-success')

    // const [tab] = await chrome.tabs.query({ currentWindow: true, active: true })
    // console.debug('tab:', tab)

    // const tabs = await chrome.tabs.query({ highlighted: true })
    // console.log('tabs:', tabs)

    // const views = chrome.extension.getViews()
    // console.log('views:', views)

    // const platform = await chrome.runtime.getPlatformInfo()
    // console.debug('platform:', platform)
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    for (const [key, { newValue }] of Object.entries(changes)) {
        if (namespace === 'sync') {
            if (key === 'options') {
                updateOptions(newValue)
            }
        }
    }
}

/**
 * Check Tab Scripting
 * TODO: Cleanup this function
 * @function checkTab
 * @return {Promise<*|Boolean>}
 */
async function checkTab() {
    try {
        const [tab] = await chrome.tabs.query({
            currentWindow: true,
            active: true,
        })
        const url = new URL(tab.url)
        if (!tab?.id || !url.hostname) {
            return [false, false]
        }
        const response = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            injectImmediately: true,
            func: function () {
                return contentScript
            },
        })
        console.log('response:', response)
        if (!response && !response[0]?.result) {
            return [false, false]
        }
        return [tab, url]
    } catch (e) {
        console.log(e)
        return [false, false]
    }
}
