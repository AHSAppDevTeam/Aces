

////////////
/* SEARCH */
////////////

const search = document.querySelector('.search')
const regex = /{(\w+) (.*?)}/g

searchURL()

class Search{
	constructor(element){
		this.element = element

		this.element.addEventListener('input',searchArticles)
	}
	searchURL(){
		const query = new URLSearchParams(window.location.search)
		for(const [name] of map){
			const parameters = query.get(name)
			if(parameters)
				search.value+=`{${name} ${parameters}}`
		}
		setTimeout(this.searchArticles,1000) // wait for articles to load (HACK)
	}
	async searchArticles(){
		const query = search.value
		const tags = Array.from(query.matchAll(regex))
		const rest = query.replaceAll(regex,'').trim()
		for await(const article of Object.values(articles))
			article.preview.hidden = !(await matchArticle(article,tags,rest))
	}
	async matchArticle(article,tags,rest){
		if(!article.public.md.toLowerCase().includes(rest))
			return false
		for(const [_,name,parameters] of tags)
			for(const parameter of parameters.toLowerCase().split('|'))
				if(!article.public[name].toString().toLowerCase().includes(parameter.trim()))
					return false
		return true
	}
}
