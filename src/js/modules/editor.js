let $editor, decorator
async function initEditor() {
	$editor = $('#editor')

	initHighlighter($('.markdown', $editor))

	$$('textarea',editor).forEach(initTextarea)

	$('.markdown', $editor).addEventListener('input', ({ target }) => {
		$('.body', $editor).innerHTML = md(target.value)
	})

	$('.render', $editor).addEventListener('click', ({ target }) => {
		const previewing = target.value == 'Preview'
		target.value = previewing ? 'Edit' : 'Preview'
		$editor.classList.toggle('render', previewing)
	})

	editArticle()
}
async function editArticle() {
	let id = window.location.pathname.split('/').pop() // Last portion of the path is the ID
	if (id.includes('.')) id = rot13(id) // A . indicates that the ID is ciphered.
	if (!id.includes('-')) return
	updateEditor(id)
	history.replaceState({}, '', id)
}

async function updateEditor(id) {
	const [article, markdown, notif]
		= await Promise.all([
			db('articles/' + id), db('markdowns/' + id), db('notifications/' + id)
		])

	if (!article) return false

	document.title = article.title
	for (const property in article) {
		const $element = $('.' + property, $editor)
		if (!$element) continue

		switch ($element.type) {
			case 'checkbox':
			case 'radio':
				$element.checked = article[property]
				break
			default:
				$element.value = article[property]
				break
		}
	}
	$('.markdown textarea', $editor).value = markdown
	$('.id', $editor).value = id
	$('.date', $editor).value = new Date(article.timestamp * 1000).toISOString().slice(0, 10)

	// if(article.notified) $('.notif',$editor).value = notif.notif

	$$('textarea',$editor).forEach(updateTextarea)
}
