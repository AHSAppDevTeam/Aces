"use strict"

const DEBUG = false

//////////
/* INIT */
//////////

const $templatePreview = $('#template-preview')
const $browser = $('#browser')
const $editor = $('#editor')

async function init(){
	const layout = await db('layout')
	const snippets = await db('snippets')
	const notifications = await db('notifications')

	$browser.append(
		...layout.map(
			location => makeGroup(location,location.categories.map(
					category => makeGroup(category,category.articleIDs.map(
							id => makePreview(snippets[id])
	))))))
	
	for(const $textarea of $$('textarea')){
		$textarea.setAttribute('rows',1)
		$textarea.addEventListener('input',()=>{
			console.log('hi')
			$textarea.style.height = 'auto'
			$textarea.style.height = $textarea.scrollHeight+'px'
		})
	}
}
function makeGroup({title},children){
	const $group = document.createElement('details')
	const $heading = document.createElement('summary')
	$heading.innerHTML = title
	$group.append($heading,...children)
	$group.setAttribute('open','')
	return $group
}

init()
