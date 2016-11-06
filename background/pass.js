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
					console.log('filling this guy', message.contents);
					//TODO: Find the tab
					
					browser.tabs.query({currentWindow: true, active: true}, function(tabs) {
						if(!tabs.length) return;
						console.log('FOUND TABS');
						let port = chrome.tabs.connect(tabs[0].id, {name: 'background'});
						port.postMessage({
							type: window.constants.FILL_ENTRY,
							contents: message.contents
						});
						port.disconnect();
					});
					break;
			}
		});
	}
});

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