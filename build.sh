#!/bin/sh
cd scripts
cat modules/*.js config.js auth.js init.js search.js resize.js editor.js preview.js article.js notif.js \
> ../dist/editor.min.js

cd ../styles
cat modules/*.css main.css editor.css auth.css \
> ../dist/editor.min.css