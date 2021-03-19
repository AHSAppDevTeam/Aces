
function make_Preview(snippet){
	// Load article properties into a preview
	const Preview = TemplatePreview.content.cloneNode(true).querySelector('a')

	update_Preview(Preview,snippet)
	// Background image
	if(snippet.thumbURLs)
		Preview.style.backgroundImage = `linear-gradient(var(--cover),var(--cover)), url(${snippet.thumbURLs[0]})`

	// preview.addEventListener('click', _=> updateEditor(article))

	// searchArticles() // terribly inefficient
	return Preview
}

function update_Preview(Preview,snippet){
	for (const property in snippet){
		const element = Preview.querySelector('.'+property)
		if(element) element.innerHTML = snippet[property]
	}
}
