const APP_NAME = 'pass_commander'

// Pass backend

function requestStore(callback) {
	browser.runtime.sendNativeMessage(APP_NAME, 'parseStore', callback);
}

function requestEntry(entry, callback) {
	browser.runtime.sendNativeMessage(APP_NAME, entry, callback);
}

// Browser action
browser.runtime.onConnect.addListener(function(port) {
	if(port.name == 'browser_action') {
		port.onMessage.addListener(function(message) {
			switch(message.type) {
				case window.constants.GET_STORE:
					requestStore(function(store) {
						port.postMessage({
							type: window.constants.GET_STORE,
							contents: store
						});
					});
					break;
				case window.constants.GET_ENTRY:
					requestEntry(message.contents.id, function(entryDetails) {
						port.postMessage({
							type: window.constants.GET_ENTRY,
							contents: entryDetails
						});
					});
					break;
				case window.constants.FILL_ENTRY:
					browser.tabs.query({currentWindow: true, active: true}, function(tabs) {
						if(!tabs.length) return;
						console.log('FOUND TABS');
						let port = chrome.tabs.connect(tabs[0].id, {name: 'background'});
						port.postMessage({
							type: window.constants.FILL_ENTRY,
							contents: replaceOTP(message.contents)
						});
						port.disconnect();
					});
					break;
			}
		});
	}
});

const otpRegex = /otpauth:\/\/([^\/]+)\/.*secret=([^&\n]+).*$/gm;

function replaceOTP(input) {
	
	var output = input;
	
	var matches;
	while(matches = otpRegex.exec(output)) {
		if(matches.length == 3) {
			// Determine type
			switch(matches[1]) {
				case 'totp':
					console.log('sending', matches[2], 'replacing', matches[0]);
					let otp = computeTOTP(matches[2]);
					output = output.replace(matches[0], otp);
					break;
				default:
					// Nothing
			}
		}
	}
	
	return output;
}

browser.commands.onCommand.addListener(function(command) {
	if(command == window.constants.SHORTCUT_COMMAND) {
		// Connect to tabs and send the fill command
		console.log('FINDING TABS');
		browser.tabs.query({currentWindow: true, active: true}, function(tabs) {
			if(!tabs.length) return;
			console.log('FOUND TABS');
			let port = chrome.tabs.connect(tabs[0].id, {name: 'background'});
			port.postMessage(window.constants.SHORTCUT_COMMAND);
			port.disconnect();
		});
	}
});