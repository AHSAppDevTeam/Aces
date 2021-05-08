#!/usr/bin/env python

# Inspired by https://gist.github.com/jtangelder/e445e9a7f5e31c220be6
# Python3 http.server for Single Page Application

import urllib.parse
import http.server
import socketserver
import re
from pathlib import Path
import os
import sys

os.chdir(os.path.join(os.path.dirname(__file__),'dist'))

try: port = int(sys.argv[1])
except IndexError: port = 8000

HOST = ('0.0.0.0', port)


class Handler(http.server.SimpleHTTPRequestHandler):
	def do_GET(self):
		url_parts = urllib.parse.urlparse(self.path)
		request_file_path = Path(url_parts.path.strip("/"))

		if not request_file_path.is_file():
			self.path = 'index.html'
		
		return http.server.SimpleHTTPRequestHandler.do_GET(self)


httpd = socketserver.TCPServer(HOST, Handler)
print('Serving Aces at http://localhost:'+str(port))
httpd.serve_forever()
