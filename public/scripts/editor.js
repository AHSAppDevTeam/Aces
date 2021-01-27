"use strict"

const DEBUG = true

//////////
/* INIT */
//////////

const database = firebase.database()
const categories = ['ASB', 'District', 'General Info']
const map = [
	['title', 'articleTitle'],
	['images', 'articleImages'],
	['author', 'articleAuthor'],
	['body', 'articleBody'],
]

categories.forEach(category => {
	database.ref('homepage').child(category).once('value', container => {
		container.forEach(snapshot => {
			// Save article to custom format
			const article_remote = snapshot.val()
			let article = new Article(snapshot.key)
			
			// Transfer public properties to local format
			article.public.category = category
			for (const [local, remote] of map)
				article.public[local] = article_remote[remote]

			// Make preview
			makePreview(article, 1)

			article.published = true
		})
	})
})

let articles = {}
let editor, preview

////////////
/* EDITOR */
////////////

const Editor = document.querySelector('.template-editor')

function clearEditor(){

	// Replace previous editor with fresh template
	let width
	if(editor) {
		width = editor.style.width
		document.body.removeChild(editor)
	}
	editor = Editor.content.cloneNode(true).querySelector('main')
	if(width) editor.style.width = width
	document.body.prepend(editor)

	// Copy-able ID
	editor.querySelector('.id').addEventListener('click', event=>{
		event.preventDefault()
		event.target.select()
		document.execCommand('copy')
		event.target.blur()
	})
}

function makeEditor(article) {

	clearEditor()
	// Mark current article as open
	if(preview) preview.classList.remove('open')
	preview = article.preview
	preview.classList.add('open')

	for (const property in article.public) {
		updateElement(
			editor.querySelector('.'+property),
			article.public[property]
		)
	}

	for(const url of article.public.images) {
		const image = document.createElement('img')
		image.src = url
		
		editor
			.querySelector('.media')
			.append(image)
	}

	editor.addEventListener('input',event=>{
		const property = event.target.classList[0]
		if(Object.keys(article.public).includes(property)){
			article.public[property] = elementContent(event.target)
			article.published = false
			updatePreview(article)
		}
	})
	
	for(const action of ['delete','publish']){
		editor
			.querySelector('.'+action)
			.addEventListener('click', _=> remoteArticle(article,action))
	}
}

function updateElement(element,content){
	if (element)
		element[
			['INPUT','SELECT'].includes(element.tagName) 
			? 'value' : 'textContent'
		] = content
}

function elementContent(element){
	return element[
		['INPUT','SELECT'].includes(element.tagName) 
		? 'value' : 'textContent'
	]
}

/////////////
/* PREVIEW */
/////////////

const Preview = document.querySelector('.template-preview')
const previewContainer = document.querySelector('.browser')

function makePreview(article,order){
	// Load article properties into a preview
	const preview = Preview.content.cloneNode(true).querySelector('article')
	article.preview = preview

	updatePreview(article)

	// Background image
	if(article.public.images) preview.style.backgroundImage = `linear-gradient(#fffd,#fffd), url(${article.public.images[0]})`

	preview.addEventListener('click', _=> makeEditor(article))

	preview.style.order = order

	previewContainer.prepend(preview)
}

function updatePreview(article){
	for (const property in article.public) {
		const element = article.preview.querySelector('.'+property)
		if (element) element.innerHTML = article.public[property]
	}
}

/////////////
/* ARTICLE */
/////////////

class Article {
	constructor (id) {
		this.media = []
		this.public = { // Data to be passed to the server
			id: id  || makeID(8),
			topic: 'General Info',
			title: 'Untitled Article',
			author: 'Alice Bobson',
			body: `Enter text here!

Words can be **bolded** or *italicized* like so.

## This is a heading

Links look like [this](https://example.com)

> This is a block quote

HTML <div>tags</div> are fine too.

For more info check out [an overview of Markdown](https://www.markdownguide.org/basic-syntax)`,
			images: []
		}
		articles[this.public.id] = this
	}
	set published (state) {
		this._published = state
		if(this.preview)
			this.preview.classList.toggle('published',state)
	}
	get published () {
		return this._published
	}
}

document.querySelector('.new-article').addEventListener('click',makeArticle)
makeArticle()

function makeArticle() {
	let article = new Article()
	article.published = false
	makePreview(article, 0)
	makeEditor(article)
}

function makeID(length=8){
	return Array(length)
		.fill(0)
		.map(_=>Math.floor(Math.random()*16).toString(16))
		.join('')
}

function remoteArticle(article, action){
	if(DEBUG) article.public.category = 'DEBUG'

	let article_remote = {}

	for(const [local,remote] of map){
		article_remote[remote] = article.public[local]
	}
	
	const reference = database.ref(`/homepage/${article.public.category}/${article.public.id}`)
	
	switch(action){
		case 'publish':
			reference.update(article_remote)
			article.published = true
			break
		case 'delete':
			reference.remove()
			article.published = false
			break
	}	
}
