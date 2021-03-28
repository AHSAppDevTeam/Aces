#!/bin/sh

# add random version number to links in order to clear cache
rand=$(date +%s)
sed -i -e "s/\?v=\w\+/\?v=$rand/g" dist/index.html

# merge scripts
cd src
cd js
cat modules/*.js \
config.js auth.js init.js \
resize.js \
> ../../dist/editor.min.js
# search.js resize.js editor.js preview.js \
# article.js remote.js webhook.js \

# merge styles
cd ..
cd css
cat modules/*.css \
font.css main.css \
auth.css \
editor.css browser.css \
> ../../dist/editor.min.css
