"use strict"

const DEBUG = false

//////////
/* INIT */
//////////

const $browser = $`#browser`

async function init(){
	initEditor()
	editArticle()

	const [ locationIDs, locations, categories, snippets ] =
	await Promise.all([ db('locationIDs'), db('locations'), db('categories'), db('snippets') ])

	$browser.append(
		...locationIDs.map(id=>locations[id]).filter(x=>x)
			.map(location=>makeGroup( location.title, location.categoryIDs.map(id=>categories[id]).filter(x=>x)
				.map(category=>makeGroup( category.title, category.articleIDs.map(id=>Object.assign(snippets[id],{id})).filter(x=>x)
					.map(snippet=>makePreview(snippet)
	))))))
}
function makeGroup(title,children){
	const $group = document.createElement`details`
	const $heading = document.createElement`summary`
	const $rest = document.createElement`section`
	$heading.innerHTML = title
	$rest.append(...children)
	$group.append($heading,$rest)
	$group.setAttribute('open','')
	return $group
}

init()
