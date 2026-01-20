const defaultSettings = {
	"enableIcons": true
};

var enableIconsCheckbox = document.getElementById("icons");

enableIconsCheckbox.addEventListener("change", function() {
	let settings = {
		enableIcons: enableIconsCheckbox.checked
	};
	browser.storage.local.set({
		settings
	});
});

document.addEventListener("DOMContentLoaded", async function() {
	let { settings = Object.keys(defaultSettings) } = await browser.storage.local.get('settings');
	if (settings.enableIcons === undefined) {
		settings.enableIcons = true;
	}
	enableIconsCheckbox.checked = settings.enableIcons;
});
