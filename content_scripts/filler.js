function fill(passDoc) {
	
	const lines = passDoc.split('\n');
	let data = {};
	let fields = {};
	
	for(let i = 0; i < lines.length; i++) {
		// Password
		if(i == 0) {
			data['password'] = lines[0];
			continue;
		}
		
		// Parse fields
		if(lines[i].indexOf('fields: |') == 0) {
			let j = i;
			let parseLine;
			while(true) {
				j++;
				if(j >= lines.length) break;
				
				parseLine = lines[j];
				if(parseLine[0] != '\t') break;
				
				const items = lines[j].substring(1).split(' ');
				fields[items[0]] = items[1];
			}
			continue;
		}
		
		// All other data
		if(lines[i].length == 0 || lines[i].trim().length == 0 || lines[i][0] == ' ' || lines[i][0] == '\t') continue;
		const parts = lines[i].split(': ');
		data[parts[0]] = parts[1];
	}
	
	// Parse fields
	for(let key in fields) {
		if(fields[key][0] == '[' && fields[key][fields[key].length-1] == ']') {
			const dataKey = fields[key].substring(1, fields[key].length-1);
			fields[key] = data[dataKey];
			continue;
		}
	}
	
	let form = null;
	
	for(let selector in fields) {
		let el = document.querySelector(selector);
		if(!el) continue;
		if(el.form) form = el.form;
		
		el.focus();
		el.value = fields[selector];
		for(let letter in fields[selector]) {
			simulateKeyPress(el, fields[selector][letter]);
		}
	}
	
	if(form) {
		submitForm(form);
	}
}

function createKeyEvent(el, type, charCode) {
	var event = el.ownerDocument.createEvent('Events');
	event.initEvent(type, true, false);
	event.charCode = charCode;
	event.keyCode = charCode;
	event.which = charCode;
	event.srcElement = el;
	event.target = el;
	return event;
}

function simulateKeyPress(element, key) {
	let oldValue = element.value;
	let changeEvent = element.ownerDocument.createEvent('HTMLEvents');
	let inputEvent = element.ownerDocument.createEvent('HTMLEvents');
	
	element.focus();
	
	element.dispatchEvent(createKeyEvent(element, 'keydown', key.charCodeAt(0)));
	element.dispatchEvent(createKeyEvent(element, 'keypress', key.charCodeAt(0)));
	element.dispatchEvent(createKeyEvent(element, 'keyup', key.charCodeAt(0)));
	
	inputEvent.initEvent('input', true, true);
	element.dispatchEvent(inputEvent);
	
	changeEvent.initEvent('change', true, true);
	element.dispatchEvent(changeEvent);
	
	element.blur();
}

function submitForm(formElement) {
	if(!formElement) return false;
	
	let submitEvent = document.createEvent('UIEvent');
	submitEvent.initEvent('submit', true, true, window, 1);
	formElement.dispatchEvent(submitEvent);
	// formElement.submit();
	return true;
}

function handleMessage(message) {
	switch(message.type) {
		case window.constants.FILL_ENTRY:
			fill(message.contents);
			break;
	}
}

function handleDisconnect() {
	this.onMessage.removeListener(handleMessage);
	this.onDisconnect.removeListener(handleDisconnect);
}

// Communication from background script
browser.runtime.onConnect.addListener(function(port) {
	port.onMessage.addListener(handleMessage);
	port.onDisconnect.addListener(handleDisconnect.bind(port));
});