.PHONY: build host deploy test

test: build host

build:
	sh build.sh
host:
	python3 server.py 8000
deploy: build
	firebase deploy
