let $editor, decorator
async function initEditor(){
    $editor = $('#editor')

    initHighlighter($('.markdown',$editor))
    
    $('.markdown',$editor).addEventListener('input',({target})=>{
        $('.body',$editor).innerHTML = md(target.value)
    })

    $('.render',$editor).addEventListener('click',({target})=>{
		const previewing = target.value == 'Preview'
		target.value = previewing ? 'Edit' : 'Preview'
		$editor.classList.toggle('render',previewing)
    })


	for(const $textarea of $$('textarea',$editor)){
		$textarea.setAttribute('rows',1)
		$textarea.addEventListener('input',()=>{
			$textarea.style.height = 'auto'
			$textarea.style.height = $textarea.scrollHeight+'px'
		})
	}
}
async function editArticle(){
    const id = rot13(window.location.pathname.split('/').pop()) // Last portion of the path is the ciphered ID
    if(id.includes('-')) updateEditor(id)
}

async function updateEditor(id){
    const article = await db('articles/'+id)
    const markdown = await db('markdowns/'+id)
    const notif = await db('notifications/'+id)

	if (!article) return false

    document.title = article.title
    for(const property in article){
        const $element = $('.'+property,$editor)
        if(!$element) continue

        switch($element.type) {
            case 'checkbox':
            case 'radio':
                $element.checked = article[property]
                break
            default:
                $element.value = article[property]
                break
        }
    }
    $('.markdown textarea',$editor).value = markdown

    $('.id',$editor).value = id

    // if(article.notified) $('.notif',$editor).value = notif.notif

    for(const $textarea of $$('textarea',$editor))
        $textarea.dispatchEvent(new Event('input'))
}