cd src
html=$(cat index.html)
js=$(cd js && cat modules/*.js config.js auth.js init.js resize.js)
css=$(cd css && cat *.css)
cd ..
printf "${html}" "${css}" "${js}" > dist/index.html
echo "built site"
