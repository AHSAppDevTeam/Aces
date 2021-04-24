#!/bin/sh
cd src
html=$(cat index.html)
js=$(cd js && cat config.js modules/*.js init.js | gcc -undef -E -P -xc -)
css=$(cd css && cat *.css)
cd ..
printf "$html" "$css" "$js" > dist/index.html
cat src/js/modules/worker.js > dist/worker.js
echo "built site"
