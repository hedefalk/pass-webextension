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
	},
	view: function(ctrl, args) {
		return [
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
		return m('li', {onclick: ctrl.requestAndFill}, args.entry.id());
	}
};

m.mount(document.getElementById('app'), MainComponent);
