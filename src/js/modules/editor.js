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


}
async function editArticle(){
    const id = rot13(window.location.pathname.split('/').pop()) // Last portion of the path is the ciphered ID
    if(id.includes('-')) updateEditor(id)
}

async function updateEditor(id){
    const [ article, markdown, notif ]
    = await Promise.all([
        db('articles/'+id), db('markdowns/'+id), db('notifications/'+id)
    ])

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
    $('.date',$editor).value = new Date(article.timestamp*1000).toISOString().slice(0,10)

    // if(article.notified) $('.notif',$editor).value = notif.notif
}
