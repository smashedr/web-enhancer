console.debug('RUNNING: highperformr.js')

const searchParams = new URLSearchParams(window.location.search)
console.debug('searchParams:', searchParams)
const webEnhancer = searchParams.get('webEnhancer')

if (webEnhancer) {
    startObserver()
}

function startObserver() {
    const observer = new MutationObserver(mutationObserver)
    const init = {
        attributes: true,
        childList: true,
        subtree: true,
    }
    observer.observe(document.body, init)
}

function mutationObserver(mutationList) {
    // console.debug('mutationList:', mutationList)
    for (const mutation of mutationList) {
        // console.debug('mutation:', mutation)
        mutation.addedNodes.forEach((el) => {
            // console.debug('el:', el)
            if (el.nodeName === 'A' && el.textContent.startsWith('Download')) {
                console.debug('download:', el)
                const download = {
                    url: el.href,
                    filename: el.download,
                }
                chrome.runtime
                    .sendMessage({ download })
                    .then(() => window.close())
            }
        })
    }
}
