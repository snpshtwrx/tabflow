# TabFlow
Easily switch and create tabs in Firefox using Rofi.

## Features
* Switch Firefox tabs using Rofi
* Create new tabs in Firefox using Rofi

## Requirements
* Firefox 109.0 or higher
* Rofi
* Python 3

## Installation
1. Clone this repository:
```bash
git clone https://github.com/snpshtwrx/tabflow
```
2. Copy the native scripts into your PATH, e.g.
```bash
cp tabflow/native/tabwriter ~/.local/bin/
cp tabflow/native/tabselect ~/.local/bin/
```
If you choose a path different to `~/.local/bin`, you need to adjust the path in step 5 to match your chosen path.
3. Make these scripts executable:
```bash
chmod u+x ~/.local/bin/tabwriter
chmod u+x ~/.local/bin/tabselect
```
4. Copy the native manifest into the native-messaging-hosts directory:
```bash
# If this directory does not exist yet, run:
mkdir ~/.mozilla/native-messaging-hosts/
cp tabflow/native/tabwriter.json ~/.mozilla/native-messaging-hosts/
```
5. Replace `<user>` with your username in the native manifest (look for the `"path"` entry in the `tabwriter.json` file).
6. Add a shortcut to the `tabselect` script, e.g. on Hyprland add the following line to your `hyprland.conf`:
```
bind = $mainMod_SHIFT, B, exec, ~/.local/bin/tabselect
```
7. Install the extension from <https://addons.mozilla.org/en-US/firefox/addon/tabflow/> or add a temporary add-on on the about:debugging page (select the `manifest.json` from the extension directory)

## Usage
Invoke the `tabselect` script, e.g. using a shortcut, and start typing the name of your desired tab.
You can search by tab name, URL or ID (though, you probably don't know the ID of a tab).
If there is no matching tab, and you still press enter, a new tab searching for the string will be opened.

## Issues
* If you encounter any bugs, feedback is greatly appreciated.
* If you want to use another search engine for results which are not in the current tab list, change the line, with the DDG search query, in the `tabselect` file to match your preferred search engine.
