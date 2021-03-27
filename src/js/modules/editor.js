let $editor, decorator
async function initEditor(){
    $editor = $('#editor')
    decorator = new Decorator(
        $('.markdown',$editor), 
        new Parser({
            bold: /([*_]{2}).*?\1/,
            italic: /([*_]).*?\1/,
            strike: /(~{2}).*?\1/,
            hr: /\s{0,3}([-+* ]{3,})$/,
            heading: /^#{1,6} *.+|(^|\n).+\n[-=]+$/,
            list: /^\s*((\d+\.)|[-+*])/,
            link: /(!?(\[.*?\]\((https?\:\/\/|mailto).*?\))|((https?\:\/\/|mailto)\S*))/,
            whitespace: /\s+/,
            other: /\S/,
        })
    )    
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
    $('.markdown textarea',$editor).value = $('.markdown pre').textContent = markdown
    decorator.update()

    $('.id',$editor).value = id

    if(article.notified) $('.notif',$editor).value = notif.notif

    for(const $textarea of $$('textarea',$editor))
        $textarea.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
        }))
}