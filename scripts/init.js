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

	Browser.append(...layout.map(location=>
		make_Group(location,location.categories.map(category=>
				make_Group(category,category.articleIDs.map(id=>
						make_Preview(snippets[id])
					)
				)
			)
		)
	))
}
function make_Group({title,id},children){
	const Group = document.createElement('summary')
	
	const heading = document.createElement('h3')
	heading.innerHTML = `${title} (#${id})`

	const details = document.createElement('details')
	details.append(...children)

	Group.append(heading,details)
	return Group
}

init()
const editor = document.querySelector('.editor')
