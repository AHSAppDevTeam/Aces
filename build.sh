#!/bin/sh
cd src
html=$(cat index.html)
js=$(cd js && cat config.js modules/*.js auth.js init.js)
css=$(cd css && cat *.css)
cd ..
printf "$html" "$css" "$js" > dist/index.html
echo "built site"