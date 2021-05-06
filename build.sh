#!/bin/sh
cd src
html=$(cat index.html)
js=$(cd js && cat config.js modules/*.js init.js)
css=$(cd css && cat *.css)
cd ..
printf "$html" "$css" "$js" > dist/index.html
cat src/js/worker.js > dist/worker.js
echo "built site"
