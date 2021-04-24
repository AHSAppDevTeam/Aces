cd src/js/modules
for file in *
do
	jsdoc2md "$file" > ../../../docs/$file.md
done
