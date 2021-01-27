"use strict"

const DEBUG = true

//////////
/* INIT */
//////////

const database = firebase.database()
const locations = {
	homepage: ['ASB', 'District', 'General Info'],
	bulletin: ['Academics', 'Athletics', 'Clubs', 'Colleges', 'Reference']
}
const map = [
	['title', 'articleTitle'],
	['images', 'articleImages'],
	['author', 'articleAuthor'],
	['body', 'articleBody'],
	['md', 'articleMd'],
	['hasHTML', 'hasHTML'],
	['featured', 'isFeatured'],
	['timestamp', 'articleUnixEpoch'],
]

for(const location in locations){
	for(const category of locations[location]){
		database.ref(location).child(category).once('value', container => {
			container.forEach(snapshot => {
				// Save article to custom format
				const article_remote = snapshot.val()
				let article = new Article(snapshot.key)

				// Transfer public properties to local format
				article.public.location = location
				article.public.category = category
				for (const [local, remote] of map)
					if(article_remote[remote])
						article.public[local] = article_remote[remote]

				// Use HTML if markdown isn't available
				article.public.md = article.public.md || article.public.body

				// Make preview
				makePreview(article, 1)

				article.published = true
			})
		})
	}
}


let articles = {}
let editor, preview


////////////
/* SEARCH */
////////////

const search = document.querySelector('.search')
const regex = '{(\w+) (.*?)}'
search.addEventListener('input',event=>{
	const val = event.target.value
})

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
			
			if(property == 'md'){
				article.public.body = marked(article.public.md)
				updateElement(
					editor.querySelector('.body'),
					article.public.body
				)
			}
			
			if(property == 'category'){
				// lotation
			}
			
			updatePreview(article)
		}
	})
	
	for(const action of ['remove','publish']){
		editor
			.querySelector('.'+action)
			.addEventListener('click', _=> remoteArticle(article,action))
	}
	editor.querySelector('.render').addEventListener('click',event=>{
		const previewing = event.target.value == 'Preview'
		event.target.value = previewing ? 'Edit' : 'Preview'
		editor.classList.toggle('render',previewing)
	})
}

function updateElement(element,content){
	if (element)
		element[elementProperty(element)] = content
}

function elementProperty(element){
	return ['checkbox'].includes(element.type) ? 'checked'
	: ['INPUT','SELECT'].includes(element.tagName) ? 'value'
	: element.className.includes('body') ? 'innerHTML'
	: 'textContent'
}

function elementContent(element){
	return element[elementProperty(element)]
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
	if(article.public.images.length) preview.style.backgroundImage = `linear-gradient(#fffd,#fffd), url(${article.public.images[0]})`

	preview.addEventListener('click', _=> makeEditor(article))

	preview.style.order = order

	previewContainer.prepend(preview)
}

function updatePreview(article){
	for (const property in article.public) {
		const element = article.preview.querySelector('.'+property)
		let val = article.public[property]
		if(typeof val == 'string') val = val.substring(0,300)
		if (element) element.innerHTML = val
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
			location: 'homepage',
			category: 'General Info',
			title: 'Untitled Article',
			author: '',
			md: '',
			hasHTML: true,
			featured: false,
			timestamp: Date.now(),
			body: '',
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
	article.public.md = `Enter text here!

Words can be **bolded** or *italicized* like so.

## This is a heading

Links look like [this](https://example.com)

> This is a block quote

HTML <s>tags</s> are fine too.

For more info check out [an overview of Markdown](https://www.markdownguide.org/basic-syntax)`
	article.public.body = marked(article.public.md)
	article.public.author =  'Alice Bobson'
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
	if(DEBUG) article.public.location = 'DEBUG'

	let article_remote = {}

	for(const [local,remote] of map){
		article_remote[remote] = article.public[local]
	}
	
	const reference = database.ref([,article.public.location,article.public.category,article.public.id].join('/'))
	
	switch(action){
		case 'publish':
			reference.update(article_remote)
			article.published = true
			break
		case 'remove':
			reference.remove()
			article.published = false
			break
	}	
}