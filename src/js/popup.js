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
    updateManifest()
    await checkPerms()

    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('options:', options)
    updateOptions(options)

    if (chrome.runtime.lastError) {
        showToast(chrome.runtime.lastError.message, 'warning')
    }

    const hostDiv = document.getElementById('host-div')
    const [tab, url] = await checkTab()
    console.debug('tab, url:', tab, url)
    if (!tab || !url) {
        hostDiv.classList.add('border-danger')
        return
    }
    hostDiv.querySelector('kbd').textContent = url.hostname
    hostDiv.classList.add('border-success')

    // const platformInfo = await chrome.runtime.getPlatformInfo()
    // console.log('platformInfo:', platformInfo)

    // const tabs = await chrome.tabs.query({ highlighted: true })
    // console.log('tabs:', tabs)

    // const views = chrome.extension.getViews()
    // console.log('views:', views)
    // const result = views.find((item) => item.location.href.endsWith('html/home.html'))
    // console.log('result:', result)
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
 * @function checkTab
 * @return {Boolean}
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
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            injectImmediately: true,
            func: function () {
                return true
            },
        })
        return [tab, url]
    } catch (e) {
        console.log(e)
        return [false, false]
    }
}
