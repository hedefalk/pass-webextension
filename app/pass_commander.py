#!/usr/bin/env python

'''
A long-running, WebExtension compatible command issuer for ZX2C4 pass.

Based on sample code from Mozilla at https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging#App_side
'''

import sys, os, json, struct, subprocess

# Read a message from stdin and decode it.
def getMessage():
	rawLength = sys.stdin.read(4)
	if len(rawLength) == 0:
		sys.exit(0)
	messageLength = struct.unpack('@I', rawLength)[0]
	message = sys.stdin.read(messageLength)
	return json.loads(message)

# Encode a message for transmission, given its content.
def encodeMessage(messageContent):
	encodedContent = json.dumps(messageContent)
	encodedLength = struct.pack('@I', len(encodedContent))
	return {'length': encodedLength, 'content': encodedContent}

# Send an encoded message to stdout.
def sendMessage(encodedMessage):
	sys.stdout.write(encodedMessage['length'])
	sys.stdout.write(encodedMessage['content'])
	sys.stdout.flush()
	
def runPass(args):
	p = subprocess.Popen(['pass'] + args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	stdout, stderr = p.communicate()
	return stdout

def cleanEscapeSequences(input):
	p = subprocess.Popen(['sed', '-e', 's/\x1B\[[0-9;]*[JKmsu]//g'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	stdout, stderr = p.communicate(input)
	return stdout

def parseStore():
	storeDir = os.environ['HOME'] + '/.password-store'
	if 'PASSWORD_STORE_DIR' in os.environ:
		storeDir = os.environ['PASSWORD_STORE_DIR']
	
	entries = []
	for root, dirs, files in os.walk(storeDir, topdown=True):
		for name in files:
			entry = os.path.join(root, name).split(storeDir + '/')[1]
			if entry[0] == '.':
				continue
			entries.append(entry.split('.gpg')[0])
			
		# for name in dirs:
		# 	print(os.path.join(root, name))
	
	return entries

if __name__ == "__main__":
	args = getMessage().split(' ')
	if args[0] == 'parseStore':
		sendMessage(encodeMessage(parseStore()))
	else:
		cleanedOutput = cleanEscapeSequences(runPass(args))
		sendMessage(encodeMessage(cleanedOutput))