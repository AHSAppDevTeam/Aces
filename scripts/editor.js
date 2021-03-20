
////////////
/* EDITOR */
////////////

const Image = document.querySelector('.template-image')

editor.querySelector('.id').addEventListener('click', event=>{
	event.target.select()
	document.execCommand('copy')
	event.target.setSelectionRange(0,0)
	event.target.blur()
})

function updatePageTitle(article){
	document.title = 'AHS|ACES: '+article.title
}
function timestampToDate(timestamp){
	return new Date(timestamp*1000).toISOString().slice(0,10)
}
function updateEditor(article) {

	editor.querySelectorAll('.media > .image').forEach(image=>image.remove())

	updatePageTitle(article)
	// Mark current article as open
	if(preview) preview.classList.remove('open')
	preview = article.preview
	preview.classList.add('open')
	
	{
		const timestamp_seconds = article.timestamp
		const local_offset_minutes = new Date().getTimezoneOffset()
		const local_timestamp_seconds = timestamp_seconds - local_offset_minutes*60
		article.public.date = timestampToDate(local_timestamp_seconds)
	}
	
	for (const property in article) {
		updateProperty(editor,article,property)
	}

	for(const url of article.public.images) {
		makeMedia(article,url,false)
	}

	editor.oninput = event=>{
		const property = event.target.classList[0]
		if(!(property in article.public)) return

		article.public[property] =  trim(elementContent(event.target))

		switch(property){
			case 'md':
				// Render HTML version of the Markdown text
				article.public.md = article.public.md.replaceAll('\n\n\n','\n\n') // fix weird newline bug
				article.public.body = renderMarkdown(article.public.md)
				updateProperty(editor,article,'body')
				break
			case 'category':
				// Assign the location of the category to the article
				article.public.location = Object
					.keys(locations)
					.find(location => locations[location].includes(article.public.category))
				break
			case 'date':
				const timestamp_seconds = Math.floor(Date.parse(article.public.date)/1000)
				const local_offset_minutes = new Date().getTimezoneOffset()
				const local_timestamp_seconds = timestamp_seconds + local_offset_minutes*60

				article.public.timestamp = local_timestamp_seconds
				break
			case 'title':
				updatePageTitle(article)
		}

		article.published = false
		updatePreview(article)
	}

	// Add media via URL
	editor.querySelector('.url').onchange = event=>{
		const url = event.target.value
		makeMedia(article,url,true)

		event.target.value = ''
		article.published = false
		updatePreview(article)
	}

	// Add media via upload
	editor.querySelector('.upload>input').onchange = async event=>{
		for(const file of event.target.files){
			const id = makeID()
			const ref = storage.child('images/'+article.public.id+'/'+id)
			const task = ref.put(file)
			task.on('state_changed',{ 'complete': ()=>{
					ref.getDownloadURL().then(url=>makeMedia(article,url,true))
			} })
		}

		event.target.files = []
		article.published = false
		updatePreview(article)
	}

	// Remove / publish article
	for(const action of ['remove','publish'])
		editor.querySelector('.'+action).onclick = () => remoteArticle(article,action)

	// Toggle rendered article
	editor.querySelector('.render').onclick = async event=>{
		const previewing = event.target.value == 'Preview'
		event.target.value = previewing ? 'Edit' : 'Preview'
		editor.classList.toggle('render',previewing)
	}
}

function typography(text) {
	return text
		.replaceAll(`(//`,`(https://`)
	// Smart quotes
		/* opening singles */
		.replace(/(^|[-\u2014\s(\["])'/g,'$1&lsquo;')
		/* closing singles & apostrophes */
		.replace(/'/g,'&rsquo;')
		/* opening doubles */
		.replace(/(^|[-\u2014/\[(\u2018\s])"/g,'$1&ldquo;')
		/* closing doubles */
		.replace(/"/g,'&rdquo;')
	// Dashes
		/* em-dashes */
		.replace(/\s?--\s?/g,'&thinsp;&mdash;&thinsp;')
		/* en-dashes */
		.replace(/(\d)\s?-\s?(\d)/g,'$1&ndash;$2')
}

function renderMarkdown(text) {
	return marked(typography(text))
}

function updateProperty(editor,article,property){
	const element = editor.querySelector('.'+property)
	if (element)
		element[elementProperty(element)] = article.public[property]
}

function elementProperty(element){
	return ['checkbox'].includes(element.type) ? 'checked'
	: ['INPUT','SELECT'].includes(element.tagName) ? 'value'
	: element.className.includes('body') ? 'innerHTML'
	: 'innerText'
}

function elementContent(element){
	return element[elementProperty(element)]
}

function makeMedia(article,url,novel=false){

	let location = 'images'
	let id = url
	const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)(\w+)/)
	const media = editor.querySelector('.media')
	
	if(youtube){
		id = youtube[1]
		url = `https://img.youtube.com/vi/${id}/sddefault.jpg` // thumbnail
		location = 'videos'
	}
	
	if(novel) article.public[location].push(id)
	
	const image = Image.content.cloneNode(true).querySelector('section')
	
	image.id = id
	image.querySelector('img').src = url

	image.querySelector('.delete').addEventListener('click',_=>{
		const index = article.public[location].indexOf(id)
		article.public[location].splice(index,1)
		image.remove()
		article.published = false
	})
	
	image.addEventListener('dragover',event=>{
		event.preventDefault()
	},false)
	image.addEventListener('dragstart',event=>{
		image.classList.add('dragged')
	},false)
	image.addEventListener('drop',event=>{
		const dragged = media.querySelector('.dragged')
		dragged.classList.remove('dragged')
		media.insertBefore(image,dragged)
		
		const oldIndex = article.public[location].indexOf(dragged.id)
		const newIndex = article.public[location].indexOf(id)
		
		article.public[location].splice(oldIndex,1)
		article.public[location].splice(newIndex,0,dragged.id)
	},false)

	image.classList.add('image')
	media.append(image)
}

function trim(x){
	return typeof x == 'string'
	? x.replace(/^[\s\uFEFF\xA0\n]+|[\s\uFEFF\xA0\n]+$/g, '')
	: x
}
