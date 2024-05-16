// JS Content Script

console.info('Web Enhancer - RUNNING content-script.js')

document.addEventListener('DOMContentLoaded', domContentLoaded)

if (!chrome.storage.onChanged.hasListener(onChanged)) {
    console.debug('Adding storage.onChanged Listener')
    chrome.storage.onChanged.addListener(onChanged)
}

async function domContentLoaded() {
    console.log('domContentLoaded')
    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('options:', options)
    if (options.autoFocus) {
        console.debug('enable: autoFocus')
        const inputs = document.querySelectorAll(
            'input[type="text"]:not([type=hidden])'
        )
        let input
        for (const el of inputs) {
            // console.debug('el:', el)
            if (el.offsetParent) {
                input = el
                break
            }
        }
        console.debug('input:', input)
        input?.focus()
    }
    if (options.hoverCopy) {
        console.debug('enable: hoverCopy')
        document.addEventListener('keydown', keyboardEvent)
    }
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
async function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options') {
            console.debug('sync.options', oldValue, newValue)
        }
    }
}

async function keyboardEvent(e) {
    // console.log('handleKeyboard:', e)
    const tagNames = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']
    if (e.repeat || tagNames.includes(e.target.tagName)) {
        return
    }
    if (e.code === 'KeyC' && e.ctrlKey) {
        console.debug('Ctrl+C')
        await copyHoverLink('href')
    }
    if (e.code === 'KeyC' && e.shiftKey) {
        console.debug('Shift+C')
        await copyHoverLink('text')
    }
}

async function copyHoverLink(type = 'href') {
    const selection = window.getSelection()
    // console.log('selection:', selection)
    if (selection.type === 'Range') {
        return console.debug('return on selection')
    }
    const hover = document.querySelector('a:hover')
    // console.debug('hover:', hover)
    if (!hover) {
        return console.debug('no hover element')
    }
    if (type === 'href') {
        if (!hover?.href) {
            return console.debug('no hover href')
        }
        console.debug('hover.href:', hover.href)
        await navigator.clipboard.writeText(hover.href)
    } else if (type === 'text') {
        console.log('text')
        let text =
            hover.textContent?.trim() ||
            hover.innerText?.trim() ||
            hover.title?.trim() ||
            hover.firstElementChild?.alt?.trim() ||
            hover.ariaLabel?.trim()
        console.log('text:', text)
        if (!text?.length) {
            return console.debug('no hover text')
        }
        navigator.clipboard.writeText(text).then()
    }
    hover.style.backgroundColor = 'rgba(0,255,0,0.1)'
    hover.style.outline = '#00c800 solid 2px'
    setTimeout(() => {
        hover.style.backgroundColor = ''
        hover.style.outline = ''
    }, 1000)
}
