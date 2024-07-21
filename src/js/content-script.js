// JS Content Script

// console.info('Web Enhancer - RUNNING content-script.js')

// document.addEventListener('DOMContentLoaded', domContentLoaded)
document.addEventListener('keydown', keyboardEvent)
document.addEventListener('click', mouseEvent)

if (!chrome.storage.onChanged.hasListener(onChanged)) {
    // console.debug('Adding storage.onChanged Listener')
    chrome.storage.onChanged.addListener(onChanged)
}

const contentScript = true
let options = {}

;(async () => {
    const data = await chrome.storage.sync.get(['options'])
    options = data.options
    // console.debug('options:', options)
    if (options.autoFocus) {
        autoFocus()
    }
    if (options.tabFocus) {
        tabFocus()
    }
})()

// async function domContentLoaded() {
//     // console.debug('domContentLoaded')
//     const data = await chrome.storage.sync.get(['options'])
//     options = data.options
//     // console.debug('options:', options)
//     if (options.autoFocus) {
//         autoFocus()
//     }
//     if (options.tabFocus) {
//         tabFocus()
//     }
//     // if (options.hoverCopy) {
//     //     console.debug('enable: hoverCopy')
//     //     document.addEventListener('keydown', keyboardEvent)
//     // }
// }

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
async function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options' && newValue) {
            console.debug('options', oldValue, newValue)
            options = newValue
        }
    }
}

async function keyboardEvent(e) {
    // console.log('handleKeyboard:', e)
    const tagNames = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']
    if (e.repeat || tagNames.includes(e.target.tagName)) {
        return
    }
    if (options.hoverCopy) {
        if (e.code === 'KeyC' && e.ctrlKey) {
            console.debug('Ctrl+C')
            await copyHoverLink('href')
        }
        if (e.code === 'KeyC' && e.shiftKey) {
            console.debug('Shift+C')
            await copyHoverLink('text')
        }
    }
}

async function mouseEvent(e) {
    // console.log('mouseEvent:', e)
    if (options.showPassword) {
        if (e.shiftKey && e.ctrlKey && e.target.tagName === 'INPUT') {
            if (e.target.type === 'password') {
                e.target.type = 'text'
                e.target.dataset.hidePassword = 'yes'
            } else if (e.target.dataset.hidePassword === 'yes') {
                e.target.type = 'password'
            } else {
                console.debug('INPUT not Password Element')
            }
        }
    }
}

// Functions

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
        console.log('hover.href:', hover.href)
        await navigator.clipboard.writeText(hover.href)
    } else if (type === 'text') {
        const text =
            hover.textContent?.trim() ||
            hover.innerText?.trim() ||
            hover.title?.trim() ||
            hover.firstElementChild?.alt?.trim() ||
            hover.ariaLabel?.trim()
        if (!text?.length) {
            return console.debug('no hover text')
        }
        console.log('text:', text)
        await navigator.clipboard.writeText(text)
    }
    hover.style.backgroundColor = 'rgba(0,255,0,0.1)'
    hover.style.outline = '#00c800 solid 2px'
    setTimeout(() => {
        hover.style.backgroundColor = ''
        hover.style.outline = ''
    }, 1000)
}

function autoFocus() {
    // console.debug('autoFocus')
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return console.debug('input already active')
    }
    const inputs = document.querySelectorAll('input, textarea')
    let input
    for (const el of inputs) {
        // console.debug('el:', el.checkVisibility())
        if (el.offsetParent) {
            input = el
            break
        }
    }
    console.debug('input:', input)
    input?.focus()
}

function tabFocus() {
    console.debug('tabFocus')

    // // Custom Functions and Events
    // // Disable blur Events
    // window.addEventListener(
    //     'blur',
    //     function (e) {
    //         e.preventDefault()
    //         e.stopPropagation()
    //         e.stopImmediatePropagation()
    //         console.log('+++window blur EVENT')
    //     },
    //     { passive: true }
    // )
    // document.addEventListener(
    //     'blur',
    //     function (e) {
    //         e.preventDefault()
    //         e.stopPropagation()
    //         e.stopImmediatePropagation()
    //         console.log('+++document blur EVENT')
    //     },
    //     { passive: true }
    // )
    //
    // // Disable focus Events
    // document.addEventListener(
    //     'focus',
    //     function (e) {
    //         e.preventDefault()
    //         e.stopImmediatePropagation()
    //         console.log('+++document focus EVENT')
    //     },
    //     { passive: true }
    // )
    // window.addEventListener(
    //     'focus',
    //     function (e) {
    //         e.preventDefault()
    //         e.stopImmediatePropagation()
    //         console.log('+++window focus EVENT')
    //     },
    //     { passive: true }
    // )
    // // Object.defineProperty(Document.prototype.wrappedJSObject, 'hasFocus', {
    // //     get: exportFunction(function hasFocus() {
    // //         return false
    // //     }, window.wrappedJSObject),
    // //     enumerable: true,
    // //     configurable: true,
    // // })
    // Object.defineProperty(
    //     Document.prototype.wrappedJSObject || Document.prototype,
    //     'hasFocus',
    //     {
    //         value: function () {
    //             return false
    //         },
    //         writable: true,
    //         enumerable: true,
    //         configurable: true,
    //     }
    // )

    // https://chromewebstore.google.com/detail/disable-page-visibility-a/eecfoibnnhheckhfokpihgefmlnenofb?hl=en
    window.addEventListener(
        'visibilitychange',
        function (event) {
            event.stopImmediatePropagation()
        },
        true
    )
    window.addEventListener(
        'webkitvisibilitychange',
        function (event) {
            event.stopImmediatePropagation()
        },
        true
    )
    window.addEventListener(
        'blur',
        function (event) {
            event.stopImmediatePropagation()
        },
        true
    )

    // // https://addons.mozilla.org/en-US/firefox/addon/disable-page-visibility/
    // // visibilitychange events are captured and stopped
    // document.addEventListener(
    //     'visibilitychange',
    //     function (e) {
    //         e.preventDefault()
    //         e.stopImmediatePropagation()
    //         console.log('+++document visibilitychange EVENT')
    //     },
    //     { passive: true }
    // )
    // // document.visibilityState always returns false
    // Object.defineProperty(Document.prototype.wrappedJSObject, 'hidden', {
    //     get: exportFunction(function hidden() {
    //         return false
    //     }, window.wrappedJSObject),
    //     enumerable: true,
    //     configurable: true,
    // })
    // // document.visibilityState always returns "visible"
    // Object.defineProperty(
    //     Document.prototype.wrappedJSObject,
    //     'visibilityState',
    //     {
    //         get: exportFunction(function visibilityState() {
    //             return 'visible'
    //         }, window.wrappedJSObject),
    //         enumerable: true,
    //         configurable: true,
    //     }
    // )
}
