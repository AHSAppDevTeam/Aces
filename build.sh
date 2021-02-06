#!/bin/sh

# add random version number to links in order to clear cache
rand=$(date +%s)
sed -i -e "s/\?v=\w\+/\?v=$rand/g" editor.html

# merge scripts
cd scripts
cat modules/*.js config.js auth.js init.js search.js resize.js editor.js preview.js article.js remote.js \
> ../dist/editor.min.js

# merge styles
cd ../styles
cat modules/*.css main.css editor.css auth.css \
> ../dist/editor.min.css
