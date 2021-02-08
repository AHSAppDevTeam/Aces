

////////////
/* SEARCH */
////////////

const search = document.querySelector('.search')
const regex = /{(\w+) (.*?)}/g

search.addEventListener('input',searchArticles)
searchURL()

function searchURL(){
	const query = new URLSearchParams(window.location.search)
	for(const [name] of map){
		const parameters = query.get(name)
		if(parameters)
			search.value+=`{${name} ${parameters}}`
	}
	setTimeout(searchArticles,1000) // wait for articles to load (HACK)
}
async function searchArticles(){
	const query = search.value
	const tags = Array.from(query.matchAll(regex))
	const rest = query.replaceAll(regex,'').trim()
	for await(const article of Object.values(articles))
		article.preview.hidden = !(await matchArticle(article,tags,rest))
}
async function matchArticle(article,tags,rest){
	if(!article.public.md.toLowerCase().includes(rest))
		return false
	for(const [_,name,parameters] of tags)
		for(const parameter of parameters.toLowerCase().split('|'))
			if(!article.public[name].toString().toLowerCase().includes(parameter.trim()))
				return false
	return true
}