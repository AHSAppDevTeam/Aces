////////////
/* SEARCH */
////////////

const search = document.querySelector('.search')
const regex = /(\w+)\:(.*?)(;|$)/g

search.addEventListener('input',searchArticles)
searchURL()

function searchURL(){
	const query = new URLSearchParams(window.location.search)
	const tags = []
	for(const [name] of map){
		const params = query.get(name)
		if(params)
			tags.push(name+': '+params)
	}
	search.value = tags.join('; ')
	setTimeout(searchArticles,1000) // wait for articles to load (HACK)
}
async function searchArticles(){
	const query = search.value
	const tags = Array.from(query.matchAll(regex))
	const rest = query.replaceAll(regex,'')
	tags.push([,'md',rest])

	for await(const article of Object.values(articles))
		article.preview.hidden = !(await matchArticle(article,tags))
}
async function matchArticle(article,tags){
	for(const [,name,params] of tags)
		if(params.split('|').every(param=>!format(article.public[name]).includes(format(param))))
			return false
	return true
}

function format(x){
	return x.toString().trim().toLowerCase()
}