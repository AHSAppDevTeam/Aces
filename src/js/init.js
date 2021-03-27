"use strict"

const DEBUG = false

//////////
/* INIT */
//////////

const $browser = $`#browser`

async function init(){
	initEditor()
	editArticle()

	const layout = await db('layout')
	const snippets = await db('snippets')

	$browser.append(
		...layout.map(
			location => makeGroup(location.title,location.categories.map(
					category => makeGroup(category.title,category.articleIDs.map(
							id => makePreview(id,snippets[id])
	))))))
	
	for(const $textarea of $$`textarea`){
		$textarea.setAttribute('rows',1)
		$textarea.addEventListener('input',()=>{
			$textarea.style.height = 'auto'
			$textarea.style.height = $textarea.scrollHeight+'px'
		})
	}
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
