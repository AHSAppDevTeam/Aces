.SILENT: build
build:
	cd src
	html=$(cat index.html)
	js=$(cd js && cat modules/*.js config.js auth.js init.js resize.js)
	css=$(cd css && cat *.css)
	printf "$html" "$css" "$js" > dist/index.html
	echo "built site"
deploy:
	firebase deploy