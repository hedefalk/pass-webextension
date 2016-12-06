// == UTIL ==

function getCurrentTabURL(callback) {
	browser.tabs.query({currentWindow: true, active: true}, function(tabs) {
		if(!tabs.length) return callback(null);
		return callback(tabs[0].url);
	});
}

const _urlParser = document.createElement('a');
function getDomainFromURL(url) {
	_urlParser.href = url;
	return getHighestDomainParts(_urlParser.hostname);
}

// Returns only one domain level deep.
// mail.google.com => google.com
// localhost => localhost
function getHighestDomainParts(hostname) {
	let parts = hostname.split('.');
	if(parts.length == 1) {
		return parts[0];
	}
	return parts[parts.length-2] + '.' + parts[parts.length-1];
}

// == COMMUNICATION ==

let port = browser.runtime.connect({name: 'browser_action'});

// == MODELS ==

const Entry = function(fullpath) {
	if(!fullpath) return;
	
	this.id = m.prop(fullpath);
	
	let separatorIndex = fullpath.lastIndexOf('/');
	if(separatorIndex == -1) {
		this.category = m.prop(null);
		this.title = m.prop(fullpath);
	} else {
		this.category = m.prop(fullpath.substring(0, separatorIndex));
		this.title = m.prop(fullpath.substring(separatorIndex + 1));
	}
};

const EntryList = Array;

// == VIEW ==

const MainComponent = {
	controller: function(args) {
		this.search = m.prop('');
		
		this.entries = new EntryList();
		this.currentTabDomain = m.prop(null);
		
		// Communication with background script
		this.handleMessage = function(message) {
			switch(message.type) {
				case window.constants.GET_STORE:
					this.entries = new EntryList();
					for(let i = 0; i < message.contents.length; i++) {
						this.entries.push(new Entry(message.contents[i]));
					}
					m.redraw();
					
					break;
				case window.constants.GET_ENTRY:
					port.postMessage({type: window.constants.FILL_ENTRY, contents: message.contents});
					break;
			}
		};
		
		port.onMessage.addListener(this.handleMessage.bind(this));
		port.postMessage({type: window.constants.GET_STORE});
		
		getCurrentTabURL(function(url) {
			this.currentTabDomain(getDomainFromURL(url));
		}.bind(this));
	},
	view: function(ctrl, args) {
		let currentTabMatchedEntries = ctrl.entries.map(function(entry) {
			if(getHighestDomainParts(entry.title()) == ctrl.currentTabDomain()) return entry;
		}).filter(function(entry) { return !!entry; });
		
		let matchedComponent = null;
		if(currentTabMatchedEntries.length) {
			matchedComponent = m('div', {class: 'matched'},
				[
					m('p', {}, 'Relevant entries:'),
					m('ul', {class: 'category'}, currentTabMatchedEntries.map(function(entry) {
						return m.component(EntryComponent, {entry: entry, onClick: ctrl.requestAndFill});
					}))
				]
			);
		}
		
		return [
			matchedComponent,
			
			m('div', {id: 'searchContainer'}, [
				m('input', {type: 'text', oninput: m.withAttr('value', ctrl.search), value: ctrl.search(), placeholder: 'Search'})
			]),
			// m('p', ctrl.search()),
			m('ul', {class: 'category'}, ctrl.entries.map(function(entry) {
				return m.component(EntryComponent, {entry: entry, onClick: ctrl.requestAndFill});
			}))
		];
	}
};

const EntryComponent = {
	controller: function(args) {
		
		this.requestAndFill = function() {
			port.postMessage({type: window.constants.GET_ENTRY, contents: {id: args.entry.id()}});
		};
	},
	view: function(ctrl, args) {
		console.log(args.entry)
		return m('li', {onclick: ctrl.requestAndFill}, args.entry.id());
	}
};

m.mount(document.getElementById('app'), MainComponent);
