# pass-webextension

Web Extension for Firefox 50+ that integrates with [ZX2C4 pass](https://www.passwordstore.org). Striving to be a great open-source alternative to 1Password.

## Setup

**THE EXTENSION WILL NOT WORK WITHOUT INSTALLING THE MANIFEST**

In order for the extension to communicate with `pass`, you must install an app manifest. [Mozilla's documentation](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging#App_manifest) explains more details about the manifest. In addition, there is python helper app that holds the connection to the browser open, making the whole process more reliable (since `pass` typically exits immediately).

- Place `app/pass_commander.json` in `~/.mozilla/native-messaging-hosts`.
- Place `pass_commander.py` in `/opt/pass-webextension`.

## Entry Format

Entries are parsed in the following way.

- Password on the first line
- Any other properties indicated with `key: value`
- Form fields are identified with the header `fields: |` and the following syntax for each field:
	- `\t` tab first character
	- Selector for the input field enclosed in double quotes. Anything you can pass to [`document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) will work.
	- `: ` a colon and a space
	- The value to be filled. Anything in `[username]` square brackets will be looked up from the other fields in the entry. Otherwise the literal value is used.
	- TOTP fields will be generated if formatted using [Google Authenticator style](https://github.com/google/google-authenticator/wiki/Key-Uri-Format).
	
### Example

```
anw2n29502nznfawl2p
username: you@example.com
two-factor: otpauth://totp/Dweezle%3A%20you%40example.com?secret=an223940znan2&issuer=Dweezle

domain: dweezle.com
location: https://dashboard.dweezle.com/login
fields: |
	"[name='email']": [username]
	"[name='password']": [password]
	".twofactor-otp-code-step input[type='tel']": [two-factor]
	"remember": true
```

## Todo

- [X] Parse pass entries and fill fields
- [X] Detect, compute, and fill TOTP codes
- [X] Detect current domain and show appropriate entries
- [ ] Automatically fill if a single entry for the domain is detected
- [ ] Search within browser action
- [ ] Keyboard shortcut
- [ ] Screenshots
- [ ] UI for editing entries