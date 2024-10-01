// JS Exports

export const githubURL = 'https://github.com/cssnr/web-enhancer'

/**
 * Save Options Callback
 * @function saveOptions
 * @param {InputEvent} event
 */
export async function saveOptions(event) {
    console.debug('saveOptions:', event)
    const { options } = await chrome.storage.sync.get(['options'])
    let key = event.target.id
    let value
    if (event.target.type === 'radio') {
        key = event.target.name
        const radios = document.getElementsByName(key)
        for (const input of radios) {
            if (input.checked) {
                value = input.id
                break
            }
        }
    } else if (event.target.type === 'checkbox') {
        value = event.target.checked
    } else if (event.target.type === 'number') {
        value = event.target.value.toString()
    } else {
        value = event.target.value
    }

    // Handle Object Subkeys
    if (key.includes('-')) {
        const subkey = key.split('-')[1]
        key = key.split('-')[0]
        console.log(`%c Set: ${key}.${subkey}:`, 'color: DeepSkyBlue', value)
        options[key][subkey] = value
    } else if (value !== undefined) {
        console.log(`Set %c ${key}:`, 'color: Khaki', value)
        options[key] = value
    } else {
        console.warn('No Value for key:', key)
    }
    await chrome.storage.sync.set({ options })
}

/**
 * Update Options based on type
 * @function initOptions
 * @param {Object} options
 */
export function updateOptions(options) {
    console.debug('updateOptions:', options)
    for (let [key, value] of Object.entries(options)) {
        // console.debug('%c Processing key:', 'color: Aqua', key)
        if (typeof value === 'undefined') {
            console.warn('Value undefined for key:', key)
            continue
        }
        if (key.startsWith('radio')) {
            key = value // NOSONAR
            value = true // NOSONAR
        }
        // console.debug(`${key}: ${value}`)

        // Handle Object Subkeys
        if (typeof value === 'object') {
            // console.debug('%c Processing Object:', 'color: Yellow', key, value)
            for (const [subKey, subValue] of Object.entries(value)) {
                // console.debug(
                //     `%c Sub-Key: ${key}-${subKey}:`,
                //     'color: Magenta',
                //     subValue
                // )
                const el = document.getElementById(`${key}-${subKey}`)
                processEl(el, subValue)
            }
            continue
        }

        const el = document.getElementById(key)
        processEl(el, value)
    }
}

/**
 * @function processEl
 * @param {HTMLElement} el
 * @param {Boolean} value
 */
function processEl(el, value) {
    // console.debug('processEl:', el, value)
    if (!el) {
        return
    }
    if (el.tagName !== 'INPUT') {
        el.textContent = value.toString()
    } else if (['checkbox', 'radio'].includes(el.type)) {
        el.checked = value
    } else {
        el.value = value
    }
    if (el.dataset.related) {
        hideShowElement(`#${el.dataset.related}`, value)
    }
}

function hideShowElement(selector, show, speed = 'fast') {
    const element = $(`${selector}`)
    // console.debug('hideShowElement:', show, element)
    if (show) {
        element.show(speed)
    } else {
        element.hide(speed)
    }
}

/**
 * Link Click Callback
 * Note: Firefox popup requires a call to window.close()
 * @function linkClick
 * @param {MouseEvent} event
 * @param {Boolean} [close]
 */
export async function linkClick(event, close = false) {
    console.debug('linkClick:', close, event)
    event.preventDefault()
    const href = event.currentTarget.getAttribute('href').replace(/^\.+/g, '')
    console.debug('href:', href)
    let url
    if (href.startsWith('#')) {
        console.debug('return on anchor link')
        return
    } else if (href.endsWith('html/options.html')) {
        chrome.runtime.openOptionsPage()
        if (close) window.close()
        return
    } else if (href.endsWith('html/panel.html')) {
        await openExtPanel()
        if (close) window.close()
        return
    } else if (href.startsWith('http')) {
        url = href
    } else {
        url = chrome.runtime.getURL(href)
    }
    console.debug('url:', url)
    await activateOrOpen(url)
    if (close) window.close()
}

/**
 * Activate or Open Tab from URL
 * @function activateOrOpen
 * @param {String} url
 * @param {Boolean} [open]
 * @return {Promise<*|Boolean>}
 */
export async function activateOrOpen(url, open = true) {
    console.debug('activateOrOpen:', url)
    const tabs = await chrome.tabs.query({ currentWindow: true })
    // console.debug('tabs:', tabs)
    for (const tab of tabs) {
        if (tab.url === url) {
            console.debug('tab:', tab)
            await chrome.tabs.update(tab.id, { active: true })
            return
        }
    }
    if (open) {
        await chrome.tabs.create({ active: true, url })
    }
}

/**
 * Update DOM with Manifest Details
 * @function updateManifest
 */
export async function updateManifest() {
    const manifest = chrome.runtime.getManifest()
    document.querySelectorAll('.version').forEach((el) => {
        el.textContent = manifest.version
    })
    document.querySelectorAll('[href="homepage_url"]').forEach((el) => {
        el.href = manifest.homepage_url
    })
    document.querySelectorAll('[href="version_url"]').forEach((el) => {
        el.href = `${githubURL}/releases/tag/${manifest.version}`
    })
}

/**
 * Check Host Permissions
 * @function checkPerms
 * @return {Promise<*|Boolean>}
 */
export async function checkPerms() {
    const hasPerms = await chrome.permissions.contains({
        origins: ['*://*/*'],
    })
    console.debug('checkPerms:', hasPerms)
    // Firefox still uses DOM Based Background Scripts
    if (typeof document === 'undefined') {
        return hasPerms
    }
    const hasPermsEl = document.querySelectorAll('.has-perms')
    const grantPermsEl = document.querySelectorAll('.grant-perms')
    if (hasPerms) {
        hasPermsEl.forEach((el) => el.classList.remove('d-none'))
        grantPermsEl.forEach((el) => el.classList.add('d-none'))
    } else {
        grantPermsEl.forEach((el) => el.classList.remove('d-none'))
        hasPermsEl.forEach((el) => el.classList.add('d-none'))
    }
    return hasPerms
}

/**
 * Grant Permissions Click Callback
 * @function grantPerms
 * @param {MouseEvent} event
 * @param {Boolean} [close]
 */
export async function grantPerms(event, close = false) {
    console.debug('grantPerms:', event)
    // noinspection ES6MissingAwait
    requestPerms()
    if (close) {
        window.close()
    }
}

/**
 * Request Host Permissions
 * @function requestPerms
 * @return {Promise<*|chrome.permissions.request>}
 */
export async function requestPerms() {
    return await chrome.permissions.request({
        origins: ['*://*/*'],
    })
}

/**
 * Revoke Permissions Click Callback
 * NOTE: For many reasons Chrome will determine host_perms are required and
 *       will ask for them at install time and not allow them to be revoked
 * @function revokePerms
 * @param {MouseEvent} event
 */
export async function revokePerms(event) {
    console.debug('revokePerms:', event)
    const permissions = await chrome.permissions.getAll()
    console.debug('permissions:', permissions)
    try {
        await chrome.permissions.remove({
            origins: permissions.origins,
        })
        await checkPerms()
    } catch (e) {
        console.log(e)
        showToast(e.toString(), 'danger')
    }
}

/**
 * Permissions On Added Callback
 * @param {chrome.permissions} permissions
 */
export async function onAdded(permissions) {
    console.debug('onAdded', permissions)
    await checkPerms()
}

/**
 * Permissions On Removed Callback
 * @param {chrome.permissions} permissions
 */
export async function onRemoved(permissions) {
    console.debug('onRemoved', permissions)
    await checkPerms()
}

/**
 * Open Extension Panel
 * @function openExtPanel
 * @param {String} [url]
 * @param {Number} [width]
 * @param {Number} [height]
 * @return {Promise<chrome.windows.Window>}
 */
export async function openExtPanel(
    url = '/html/panel.html',
    width = 1280,
    height = 720
) {
    console.debug(`openExtPanel: ${url}`, width, height)
    const windows = await chrome.windows.getAll({ populate: true })
    for (const window of windows) {
        // console.debug('window:', window)
        if (window.tabs[0]?.url?.endsWith(url)) {
            console.debug(`%c Panel found: ${window.id}`, 'color: Lime')
            return chrome.windows.update(window.id, { focused: true })
        }
    }
    return chrome.windows.create({ type: 'panel', url, width, height })
}

/**
 * Show Bootstrap Toast
 * @function showToast
 * @param {String} message
 * @param {String} type
 */
export function showToast(message, type = 'success') {
    console.debug(`showToast: ${type}: ${message}`)
    const clone = document.querySelector('.d-none .toast')
    const container = document.getElementById('toast-container')
    if (!clone || !container) {
        return console.warn('Missing clone or container:', clone, container)
    }
    const element = clone.cloneNode(true)
    element.querySelector('.toast-body').innerHTML = message
    element.classList.add(`text-bg-${type}`)
    container.appendChild(element)
    const toast = new bootstrap.Toast(element)
    element.addEventListener('mousemove', () => toast.hide())
    toast.show()
}

/**
 * Inject Function into Current Tab with args
 * @function injectFunction
 * @param {Function} func
 * @param {Array} [args]
 */
export async function injectFunction(func, args) {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true })
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: func,
        args: args,
    })
}

/**
 * Copy Text of ctx.linkText or from Active Element
 * NOTE: Chrome does not support ctx.linkText
 * @function copyActiveElementText
 * @param {Object} ctx
 */
export function copyActiveElementText(ctx) {
    console.debug('copyActiveElementText:', ctx)
    // noinspection JSUnresolvedReference
    let text =
        ctx.linkText?.trim() ||
        document.activeElement.innerText?.trim() ||
        document.activeElement.title?.trim() ||
        document.activeElement.firstElementChild?.alt?.trim() ||
        document.activeElement.ariaLabel?.trim()
    console.log('text:', text)
    if (text?.length) {
        navigator.clipboard.writeText(text).then()
    } else {
        console.info('No Text to Copy.')
    }
}

/**
 * Show/Hide Password Input
 * @function showHidePassword
 */
export function showHidePassword() {
    console.debug('showHidePassword')
    console.log('document.activeElement:', document.activeElement)
    if (document.activeElement?.tagName === 'INPUT') {
        if (document.activeElement.type === 'password') {
            document.activeElement.type = 'text'
            document.activeElement.dataset.hidePassword = 'yes'
        } else if (document.activeElement.dataset.hidePassword === 'yes') {
            document.activeElement.type = 'password'
        } else {
            console.debug('INPUT not Password Element')
        }
    } else {
        console.info('activeElement Not Found or Not INPUT.')
    }
}
