let port = browser.runtime.connect({name: 'browser_action'});
port.postMessage({type: window.constants.GET_STORE});

let storeEntries = [];

port.onMessage.addListener(function(message) {
	switch(message.type) {
		case window.constants.GET_STORE:
			storeEntries = message.contents;
			render();
			break;
	}
});

// -- Root --
const parser = new DOMParser();
const app = document.getElementById('app');
function render() {
	app.innerHTML = MainComponent();
}

function MainComponent() {
	return html`
		<ul>
		${storeEntries.map(function(entry) {
			return StoreEntry(entry);
		})}
		</ul>
	`;
}

function StoreEntry(entry) {
	return html`
		<li>
			${entry}
		</li>
	`;
}