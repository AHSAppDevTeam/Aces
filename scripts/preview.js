
/////////////
/* PREVIEW */
/////////////

const Preview = document.querySelector('.template-preview')
const previewContainer = document.querySelector('.browser')

function makePreview(article,order){
	// Load article properties into a preview
	const preview = Preview.content.cloneNode(true).querySelector('button')
	article.preview = preview

	updatePreview(article)

	// Background image
	if(article.public.images.length) preview.style.backgroundImage = `linear-gradient(var(--cover),var(--cover)), url(${article.public.images[0]})`

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
