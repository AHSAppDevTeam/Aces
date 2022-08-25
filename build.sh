#!/bin/sh

npx webpack
cd src
cp static/* ../dist/

cat css/*.css \
> ../dist/style.css

echo "built site"
