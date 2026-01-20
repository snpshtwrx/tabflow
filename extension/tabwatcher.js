// INFO: Connect to the client side tabwriter program for communication
let port = browser.runtime.connectNative("tabwriter");

const defaultSettings = {
	"enableIcons": true
};

let cache = {};
// INFO: Write the initial tab list, when the extension is loaded
browser.tabs.query({}).then(writeTabsAsMessage, onError);

// INFO: Listen for incoming client messages and process them
port.onMessage.addListener((response) => {
	var tabId = parseInt(response);
	browser.tabs.update(tabId, {
		active: true
	});
});

// INFO: Hash some input data return as hex string
async function hashString(input) {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);

	const hashBuffer = await crypto.subtle.digest('SHA-256', data);

	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
	return hashHex;
}

// INFO: Try to fetch the favicon from a given URL
async function fetchFavicon(favIconUrl) {
	try {
		const response = await fetch(favIconUrl);
		if (!response.ok) {
			throw new Error('Favicon not found');
		}
		return response.url;
	} catch (error) {
		console.error(error);
	}
}

// INFO: Send all tabs, apart from the ids specified in excludeTabs, to the client for further processing
async function writeTabsAsMessage(tabs, excludeTabs = []) {
	var output = "";
	var sentFavIcons = {};
	var { settings = Object.keys(defaultSettings) } = await browser.storage.local.get('settings');
	var enableIcons = settings.enableIcons;
	// In case the settings page has never been loaded
	// Enables icons by default
	if (enableIcons === undefined) {
		enableIcons = true;
	}
	
	for (const tab of tabs) {
		if (excludeTabs.includes(tab.id)) {
			continue;
		}
		output = output + tab.id + "\t" + tab.title + "\t" + tab.url;
		let favIconUrl = tab.favIconUrl;
		if (enableIcons && favIconUrl !== undefined && favIconUrl !== "" && !favIconUrl.startsWith("chrome")) {
			if (!cache.hasOwnProperty(favIconUrl)) {
				const dataUrl = await fetchFavicon(favIconUrl);
				if (dataUrl !== undefined) {
					cache[favIconUrl] = dataUrl
				}
			}
			// INFO: To avoid sending the data url all the time implement some caching of what
			// we've already written into the output. If a given favicon url has already been
			// seen we do not need to send the whole data string again.
			// We unfortunately cannot implement this completely global because this would require
			// the tabselect script to always run on update.
			// Unless we migrate that logic to the tabwriter...
			if (!sentFavIcons.hasOwnProperty(favIconUrl)) {
				sentFavIcons[favIconUrl] = true;
				output = output + "\t" + cache[favIconUrl];
			} else {
				const name = (await hashString(cache[favIconUrl])) + ".ico";
				output = output + "\t" + name;
			}
		}
		output += "\n";
	}
	port.postMessage(output);
}

// INFO: Error logging (just took this from the docs)
function onError(error) {
	console.error(`Error: ${error}`);
}

// INFO: Send tabs when a tab is closed
browser.tabs.onRemoved.addListener((tabId, _) => {
	browser.tabs.query({}).then((data) => {
		writeTabsAsMessage(data, [tabId]);
	}, onError);
});

// INFO: Filter by the status property
const statusFilter = {
	properties: ["status"]
};
browser.tabs.onUpdated.addListener((_, changeInfo, __) => {
	// INFO: Only write the tabs when the tab has finished loading
	if (changeInfo["status"] === "complete") {
		browser.tabs.query({}).then(writeTabsAsMessage, onError);
	}
}, statusFilter);
