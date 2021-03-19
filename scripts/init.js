"use strict"

const DEBUG = false

//////////
/* INIT */
//////////


const TemplatePreview = document.querySelector('.template-preview')
const Browser = document.querySelector('.browser')

async function init(){
	const layout = await db('layout')
	const snippets = await db('snippets')
	const notifications = await db('notifications')

	Browser.append(
		...layout.map(
			location => make_Group(location,location.categories.map(
					category => make_Group(category,category.articleIDs.map(
							id => make_Preview(snippets[id])
	))))))
}
function make_Group({title,id},children){
	const Group = document.createElement('details')
	const heading = document.createElement('summary')
	heading.innerHTML = `${title} (#${id})`
	Group.append(heading,...children)
	return Group
}

init()
const editor = document.querySelector('.editor')
