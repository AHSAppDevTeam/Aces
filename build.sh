#!/bin/sh
cd scripts
cat marked.min.js config.js auth.js init.js search.js resize.js editor.js preview.js article.js notif.js \
> ../dist/editor.min.js

cd ../styles
cat normalize.css main.css editor.css auth.css \
> ../dist/editor.min.css