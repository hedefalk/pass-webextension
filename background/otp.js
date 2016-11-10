// Code from https://jsfiddle.net/russau/ch8PK/

function decToHex(s) { return (s < 15.5 ? '0' : '') + Math.round(s).toString(16); }
function hexToDec(s) { return parseInt(s, 16); }

function base32ToHex(base32) {
	const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	let bits = '';
	let hex = '';

	for (let i = 0; i < base32.length; i++) {
		let val = base32chars.indexOf(base32.charAt(i).toUpperCase());
		bits += leftpad(val.toString(2), 5, '0');
	}

	for (let i = 0; i+4 <= bits.length; i+=4) {
		let chunk = bits.substr(i, 4);
		hex = hex + parseInt(chunk, 2).toString(16) ;
	}
	return hex;
}

function leftpad(str, len, pad) {
	if (len + 1 >= str.length) {
		str = Array(len + 1 - str.length).join(pad) + str;
	}
	return str;
}

function computeTOTP(secret) {
	let key = base32ToHex(secret);
	let epoch = Math.round(new Date().getTime() / 1000.0);
	let time = leftpad(decToHex(Math.floor(epoch / 30)), 16, '0');
	
	let shaObj = new jsSHA('SHA-1', 'HEX');
	shaObj.setHMACKey(key, 'HEX');
	shaObj.update(time);
	var hmac = shaObj.getHMAC('HEX');

	//$('#qrImg').attr('src', 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=200x200&chld=M|0&cht=qr&chl=otpauth://totp/user@host.com%3Fsecret%3D' + $('#secret').val());

	// if (hmac == 'KEY MUST BE IN BYTE INCREMENTS') {
	// 	$('#hmac').append($('<span/>').addClass('label important').append(hmac));
	// } else {
		// let offset = hexToDec(hmac.substring(hmac.length - 1));
		// let part1 = hmac.substr(0, offset * 2);
		// let part2 = hmac.substr(offset * 2, 8);
		// let part3 = hmac.substr(offset * 2 + 8, hmac.length - offset);
	// }
	let offset = hexToDec(hmac.substring(hmac.length - 1));
	let totp = (hexToDec(hmac.substr(offset * 2, 8)) & hexToDec('7fffffff')) + '';
	totp = (totp).substr(totp.length - 6, 6);

	return totp;
}