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
    if (
        e.altKey ||
        e.metaKey ||
        e.shiftKey ||
        e.repeat ||
        tagNames.includes(e.target.tagName)
    ) {
        return
    }
    if (e.code === 'KeyC' && e.ctrlKey) {
        // console.debug('Ctrl+C')
        await copyHoverLink()
    }
}

async function copyHoverLink() {
    const selection = window.getSelection()
    // console.log('selection:', selection)
    if (selection.type === 'Range') {
        console.debug('return on selection')
        return
    }
    const hover = document.querySelector('a:hover')
    // console.debug('hover:', hover)
    if (!hover?.href) {
        console.debug('no hover link href found')
        return
    }
    console.debug('hover.href:', hover.href)
    await navigator.clipboard.writeText(hover.href)
    const border = hover.style.border
    hover.style.border = '1px solid lightgreen'
    setTimeout(() => {
        hover.style.border = border
    }, 1000)
}
