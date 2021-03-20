
function makePreview(snippet){
	const $preview = $templatePreview.content.cloneNode(true).querySelector('a')
	updatePreview($preview,snippet)
	return $preview
}

function updatePreview($preview,snippet){
	$('.title',$preview).innerHTML = snippet.title
	// $('.')
	if(snippet.thumbURLs)
		$preview.style.backgroundImage = `linear-gradient(var(--cover),var(--cover)), url(${snippet.thumbURLs[0]})`
}