"use strict"

const DEBUG = false

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
			.map(id=>makeGroup('location', id, locations[id].title, locations[id].categoryIDs
				.map(id=>makeGroup('category', id, categories[id].title, categories[id].articleIDs
					.map(id=>makePreview(id, snippets[id])
	))))))
}
init()

