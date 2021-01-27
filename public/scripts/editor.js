"use strict"

const database = firebase.database()
let articles = {}
const topics = ['ASB', 'District', 'General Info']
const map = [
  ['title', 'articleTitle'],
  ['images', 'articleImages'],
  ['author', 'articleAuthor'],
  ['body', 'articleBody'],
]


topics.forEach(topic => {
  database.ref('homepage').child(topic).once('value', container => {
    container.forEach(snapshot => {
      // Save article to custom format
      const article_remote = snapshot.val()
      let article = new Article(snapshot.key)
      article.public.topic = topic
      for (const [local, remote] of map) {
        article.public[local] = article_remote[remote]
      }
      makePreview(article, 1)
    })
  })
})

const Preview = document.querySelector('.template-preview')
const Editor = document.querySelector('.template-editor')
class Article {
	constructor (id) {
    this.media = []
    this.public = {
	    id: id  || makeID(8),
      topic: 'General Info',
      title: 'Untitled Article',
      author: 'Alice Bobson',
      body:
`Enter text here!

This box supports Markdown syntax, so text can be **bolded** or *italicized* like so.

## This is a heading

Links look like [this](https://example.com)

HTML <div>tags</div> are fine too.`,
      images: []
    }
	  articles[this.public.id] = this
  }
}

const browser = document.querySelector('.browser')
const clipboard = document.querySelector('.clipboard')
let editor, preview
const newArticleButton = document.querySelector('.new-article')

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

function editArticle(article) {
  
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
    editor.querySelector('.media').append(image)
  }
  
  editor.addEventListener('input',event=>{
  	const property = event.target.classList[0]
    if(Object.keys(article.public).includes(property))
    	article.public[property] = elementContent(event.target)
      updatePreview(article)
  })
  
}
function makePreview(article,order){
  // Load article properties into a preview
  const preview = Preview.content.cloneNode(true).querySelector('article')
  article.preview = preview
  
	updatePreview(article)

  // Background image
  if(article.public.images) preview.style.backgroundImage = `linear-gradient(#fffd,#fffd), url(${article.public.images[0]})`

  preview.addEventListener('click', () => {
    editArticle(article)
  })

	preview.style.order = order
  
  browser.prepend(preview)
}

function updatePreview(article){
  for (const property in article.public) {
    const element = article.preview.querySelector('.'+property)
    if (element) element.innerHTML = article.public[property]
  }
}

newArticleButton.addEventListener('click',newArticle)

function newArticle() {
	let article = new Article()
  makePreview(article, 0)
  editArticle(article)
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

newArticle()

function makeID(length=8){
	return Array(length)
  	.fill(0)
    .map(_=>Math.floor(Math.random()*16).toString(16))
    .join('')
}