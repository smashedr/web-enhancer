// JS for sidepanel.html

import { linkClick, openPopup, updateManifest } from './export.js'

chrome.tabs.onActivated.addListener(onActivated)
document.addEventListener('DOMContentLoaded', domContentLoaded)
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', linkClick))
document
    .querySelectorAll('.open-popup')
    .forEach((el) => el.addEventListener('click', openPopup))
// document
//     .querySelectorAll('.close-panel')
//     .forEach((el) => el.addEventListener('click', closePanel))
document
    .querySelectorAll('[data-click]')
    .forEach((el) => el.addEventListener('click', clickHandler))

const inputForm = document.getElementById('input-form')
const inputSelect = document.getElementById('input-select')
inputSelect.addEventListener('change', selectChange)

const selectInput = document.getElementById('select-input')
selectInput.addEventListener('change', inputChange)
// selectInput.addEventListener('click', inputClick)

document.getElementById('select-input').addEventListener('change', inputChange)

const hostnameEl = document.getElementById('hostname')

/**
 * DOMContentLoaded
 * @function domContentLoaded
 */
async function domContentLoaded() {
    console.debug('domContentLoaded')
    // noinspection ES6MissingAwait
    updateManifest()
    // noinspection ES6MissingAwait
    tabChange()

    // const { options } = await chrome.storage.sync.get(['options'])
    // console.debug('options:', options)
}

/**
 * Click Handler Callback
 * @param {UIEvent} [event]
 */
async function clickHandler(event) {
    // console.debug('clickHandler:', event)
    const target = event.currentTarget
    event?.preventDefault()
    console.debug('target.dataset?.click:', target?.dataset?.click)
    if (target?.dataset?.click === 'reload') {
        selectInput.value = ''
        inputForm.reset()
        window.location.reload()
    } else if (target?.dataset?.click === 'close') {
        // noinspection JSUnresolvedReference
        if (typeof browser !== 'undefined') {
            // noinspection JSUnresolvedReference
            await browser.sidebarAction.close()
        } else {
            window.close()
        }
    }
}

/**
 * Click Handler Callback
 * @param {InputEvent} [event]
 */
async function selectChange(event) {
    console.debug('selectChange:', event)
    const target = event.currentTarget
    event?.preventDefault()
    console.debug('target:', target)
    console.debug('target.value:', target.value)
    const selectedOption = target.options[target.selectedIndex]
    console.debug('selectedOption:', selectedOption)
    selectInput.placeholder = selectedOption.textContent
    selectInput.dataset.action = target.value
}

/**
 * Input Change Callback
 * @param {InputEvent} [event]
 */
async function inputChange(event) {
    console.debug('inputChange:', event)
    const target = event.currentTarget
    event?.preventDefault()
    console.debug('target:', target)
    console.debug('target.value:', target.value)
    console.debug('inputSelect.value:', inputSelect.value)
    if (inputSelect.value === 'encode') {
        console.debug('encode:', target.value)
        const result = encodeURIComponent(target.value)
        console.debug('result:', result)
        await navigator.clipboard.writeText(result)
    } else if (inputSelect.value === 'decode') {
        console.debug('decode:', target.value)
        const result = decodeURIComponent(target.value)
        console.debug('result:', result)
        await navigator.clipboard.writeText(result)
    }

    target.classList.add('is-valid')
    setTimeout(() => event.target.classList.remove('is-valid'), 1000)
}

// /**
//  * Input Click Callback
//  * @param {InputEvent} [event]
//  */
// async function inputClick(event) {
//     console.debug('inputClick:', event)
//     const target = event.currentTarget
//     // event?.preventDefault()
//     console.debug('target:', target)
//     console.debug('activeElement:', document.activeElement)
// }

// /**
//  * Close Side Panel Click Callback
//  * @function closePanel
//  * @param {Event} [event]
//  */
// async function closePanel(event) {
//     console.debug('closePanel:', event)
//     event?.preventDefault()
//     // noinspection JSUnresolvedReference
//     if (typeof browser !== 'undefined') {
//         // noinspection JSUnresolvedReference
//         await browser.sidebarAction.close()
//     } else {
//         window.close()
//     }
// }

/**
 * Tab Change Callback
 * @function onActivated
 * @param {chrome.tabs.TabActiveInfo} activeInfo
 */
async function onActivated(activeInfo) {
    console.debug('onActivated:', activeInfo)
    const window = await chrome.windows.getCurrent()
    // console.debug('window:', window)
    if (window.id !== activeInfo.windowId) {
        return console.debug('Tab Change - Different Window.')
    }
    console.debug('%cTab Change - Update Tab Data.', 'color: Lime')
    // noinspection ES6MissingAwait
    tabChange()
}

/**
 * Process Tab Changes
 * @function tabChange
 */
async function tabChange() {
    const [tab] = await chrome.tabs.query({
        currentWindow: true,
        active: true,
    })
    console.debug('tab:', tab)
    console.debug('tab.url:', tab.url)
    if (tab.url) {
        hostnameEl.textContent = tab.url
    } else {
        hostnameEl.textContent = 'No URL for Tab'
    }
}
