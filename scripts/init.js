"use strict"

const DEBUG = false

//////////
/* INIT */
//////////

const database = firebase.database()
const messaging=firebase.messaging()
let messaging_token

const locations = {
	bulletin: ['Academics', 'Athletics', 'Clubs', 'Colleges', 'Reference'],
	homepage: ['General_Info', 'ASB', 'District'],
	debug: ['DEBUG'],
}
const map = [
	['id', null, 'notificationArticleID'],
	['title', 'articleTitle', 'notificationTitle'],
	['category', null, 'notificationCategory'],
	['images', 'articleImages', null],
	['videos', 'articleVideoIDs', null],
	['author', 'articleAuthor', null],
	['body', 'articleBody', null],
	['md', 'articleMd', null],
	['hasHTML', 'hasHTML', null],
	['feature', 'isFeatured', null],
	['notify', 'isNotified', null],
	['notif', null, 'notificationBody'],
	['timestamp', 'articleUnixEpoch','notificationUnixEpoch'],
]

for(const location in locations){
	for(const category of locations[location]){
		database.ref(location).child(category).orderByChild('articleUnixEpoch').once('value', container => {
			container.forEach(snapshot => {
				// Save article to custom format
				let article = new Article(snapshot.key)
				const article_remote = snapshot.val()

				// Transfer public properties to local format
				article.public.location = location
				article.public.category = category
				for (const [local, remote, _] of map)
					if(article_remote[remote])
						article.public[local] = article_remote[remote]

				// Use HTML if markdown isn't available
				article.public.md = article.public.md || article.public.body

				// Make preview
				makePreview(article, 1)

				article.published = true
			})
		})
	}
}

database.ref('notifications').once('value', container=>{
	container.forEach(snapshot => {
		const notif_remote = snapshot.val()
		const article = articles[notif_remote.notificationArticleID]
		if(article){
			article.public.notify = true
			for(const [local, _, remote] of map)
				if(notif_remote[remote] && !article.public[local])
					article.public[local] = notif_remote[remote]
		}
	})
})


let articles = {}
let editor, preview
