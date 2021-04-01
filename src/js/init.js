"use strict"

const DEBUG = true

//////////
/* INIT */
//////////

const $browser = $('#browser')

async function init(){
	initEditor()
	editArticle()

	const [ locationIDs, locations, categories, snippets ] =
	await Promise.all([ 
		db('locationIDs'), db('locations'), db('categories'), db('snippets')
	])
	
	$browser.append(
		...locationIDs
			.map(id=>makeGroup('location', id, locations[id], locations[id].categoryIDs
				.map(id=>makeGroup('category', id, categories[id], categories[id].articleIDs
					.map(id=>makePreview(id, snippets[id])
	))))))
}
init()

