#!/bin/sh
cd src
cat index.html > ../dist/index.html
cat js/config.js js/modules/*.js js/init.js > ../dist/script.js
cat js/worker.js > ../dist/worker.js
cat css/*.css > ../dist/style.css
echo "built site"
