[![GitHub Release Version](https://img.shields.io/github/v/release/smashedr/web-enhancer?logo=github)](https://github.com/smashedr/web-enhancer/releases/latest)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/smashedr/web-enhancer?logo=github&logoColor=white&label=updated)](https://github.com/smashedr/web-enhancer/graphs/commit-activity)
[![GitHub Top Language](https://img.shields.io/github/languages/top/smashedr/web-enhancer?logo=htmx&logoColor=white)](https://github.com/smashedr/web-enhancer)
[![GitHub Org Stars](https://img.shields.io/github/stars/cssnr?style=flat&logo=github&logoColor=white)](https://cssnr.github.io/)
[![Discord](https://img.shields.io/discord/536290056571453450?logo=discord&logoColor=white&label=discord&color=7289da)](https://discord.gg/6pzXJE5)

# Web Enhancer

Modern Chrome Web Extension and Firefox Browser Addon to Enhance the Web.

- [Install](#install)
- [Features](#features)
- [Configuration](#configuration)
- [Development](#development)
  - [Building](#building)
- [Contributing](#Contributing)

# Install

- [Google Chrome Web Store](https://github.com/smashedr/web-enhancer/releases/latest)
- [Mozilla Firefox Add-ons](https://github.com/smashedr/web-enhancer/releases/latest)

[![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png)](https://github.com/smashedr/web-enhancer/releases/latest)
[![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png)](https://github.com/smashedr/web-enhancer/releases/latest)
[![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png)](https://github.com/smashedr/web-enhancer/releases/latest)
[![Chromium](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chromium/chromium_48x48.png)](https://github.com/smashedr/web-enhancer/releases/latest)
[![Brave](https://raw.githubusercontent.com/alrra/browser-logos/main/src/brave/brave_48x48.png)](https://github.com/smashedr/web-enhancer/releases/latest)
[![Vivaldi](https://raw.githubusercontent.com/alrra/browser-logos/main/src/vivaldi/vivaldi_48x48.png)](https://github.com/smashedr/web-enhancer/releases/latest)
[![Opera](https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png)](https://github.com/smashedr/web-enhancer/releases/latest)

All **Chromium** Based Browsers can install the extension from the
[Chrome Web Store](https://github.com/smashedr/web-enhancer/releases/latest).

# Features

- Hover Copy for Links and Text
- Password Revealer
- Visibility API Disabler

Please submit a [Feature Request](https://github.com/smashedr/web-enhancer/discussions/categories/feature-requests)
for new features.  
For any issues, bugs or concerns; please [Open an Issue](https://github.com/smashedr/web-enhancer/issues).

# Configuration

You can pin the Addon by clicking the `Puzzle Piece`, find the Web Extension icon, then;  
**Chrome,** click the `Pin` icon.  
**Firefox,** click the `Settings Wheel` and `Pin to Toolbar`.

To open the options, click on the icon (from above) then click `Open Options`.  
Here you can set flags and add as many saved regular expressions as you would like for easy use later.  
Make sure to click`Save Options` when finished.

# Development

**Quick Start**

First, clone (or download) this repository and change into the directory.

Second, install the dependencies:

```shell
npm install
```

Finally, to run Chrome or Firefox with web-ext, run one of the following:

```shell
npm run chrome
npm run firefox
```

Additionally, to Load Unpacked/Temporary Add-on make a `manifest.json` and run from the [src](src) folder, run one of
the following:

```shell
npm run manifest:chrome
npm run manifest:firefox
```

Chrome: [https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)  
Firefox: [https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

For more information on
web-ext, [read this documentation](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/).  
To pass additional arguments to an `npm run` command, use `--`.  
Example: `npm run chrome -- --chromium-binary=...`

## Building

Install the requirements and copy libraries into the `src/dist` directory by running `npm install`.
See [gulpfile.js](gulpfile.js) for more information on `postinstall`.

```shell
npm install
```

To load unpacked or temporary addon from the [src](src) folder, you must generate the `src/manifest.json` for the
desired browser.

```shell
npm run manifest:chrome
npm run manifest:firefox
```

If you would like to create a `.zip` archive of the [src](src) directory for the desired browser.

```shell
npm run build
npm run build:chrome
npm run build:firefox
```

For more information on building, see the scripts in the [package.json](package.json) file.

## Chrome Setup

1. Build or Download a [Release](https://github.com/smashedr/web-enhancer/releases).
1. Unzip the archive, place the folder where it must remain and note its location for later.
1. Open Chrome, click the `3 dots` in the top right, click `Extensions`, click `Manage Extensions`.
1. In the top right, click `Developer Mode` then on the top left click `Load unpacked`.
1. Navigate to the folder you extracted in step #3 then click `Select Folder`.

## Firefox Setup

1. Build or Download a [Release](https://github.com/smashedr/web-enhancer/releases).
1. Unzip the archive, place the folder where it must remain and note its location for later.
1. Go to `about:debugging#/runtime/this-firefox` and click `Load Temporary Add-on...`
1. Navigate to the folder you extracted earlier, select `manifest.json` then click `Select File`.
1. Optional: Open `about:config` search for `extensions.webextensions.keepStorageOnUninstall` and set to `true`.

If you need to test a restart, you must pack the addon. This only works in ESR, Development, or Nightly.
You may also use an Unbranded
Build: [https://wiki.mozilla.org/Add-ons/Extension_Signing#Unbranded_Builds](https://wiki.mozilla.org/Add-ons/Extension_Signing#Unbranded_Builds)

1. Run `npm run build:firefox` then use `web-ext-artifacts/{name}-firefox-{version}.zip`.
1. Open `about:config` search for `xpinstall.signatures.required` and set to `false`.
1. Open `about:addons` and drag the zip file to the page or choose Install from File from the Settings wheel.

# Contributing

Currently, the best way to contribute to this project is to give a 5-star rating on
[Google](https://chromewebstore.google.com/detail/smwc-web-extension/foalfafgmnglcgpgkhhmcfhjgmdcjide) or
[Mozilla](https://addons.mozilla.org/addon/smwc-web-extension) and to star this project on GitHub.

Other Web Extensions I have created and published:

- [Link Extractor](https://github.com/cssnr/link-extractor)
- [Open Links in New Tab](https://github.com/cssnr/open-links-in-new-tab)
- [Auto Auth](https://github.com/cssnr/auto-auth)
- [Cache Cleaner](https://github.com/cssnr/cache-cleaner)
- [HLS Video Downloader](https://github.com/cssnr/hls-video-downloader)
- [SMWC Web Extension](https://github.com/cssnr/smwc-web-extension)
- [PlayDrift Extension](https://github.com/cssnr/playdrift-extension)
- [ASN Plus](https://github.com/cssnr/asn-plus)
- [Aviation Tools](https://github.com/cssnr/aviation-tools)
- [Text Formatter](https://github.com/cssnr/text-formatter)

For a full list of current projects visit: [https://cssnr.github.io/](https://cssnr.github.io/)
