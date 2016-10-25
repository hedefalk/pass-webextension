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
			
		}
	});
	
	
});