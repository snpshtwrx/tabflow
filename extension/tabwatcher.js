// INFO: Connect to the client side tabwriter program for communication
let port = browser.runtime.connectNative("tabwriter");
// INFO: Write the initial tab list, when the extension is loaded
browser.tabs.query({}).then(writeTabsAsMessage, onError);

// INFO: Listen for incoming client messages and process them
port.onMessage.addListener((response) => {
	var tabId = parseInt(response);
	browser.tabs.update(tabId, {
		active: true
	});
});

// INFO: Send all tabs, apart from the ids specified in excludeTabs, to the client for further processing
function writeTabsAsMessage(tabs, excludeTabs = []) {
	var output = "";
	for (const tab of tabs) {
		if(excludeTabs.includes(tab.id)) {
			continue;
		}
		output = output + tab.id + "\t" + tab.title + "\t" + tab.url + "\n";
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
