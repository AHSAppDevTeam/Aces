"use strict"

const DEBUG = false

//////////
/* INIT */
//////////

const database = firebase.database()
const storage = firebase.storage().ref()
let messaging_token

const locations = {
	bulletin: ['Academics', 'Athletics', 'Clubs', 'Colleges', 'Reference'],
	homepage: ['General_Info', 'ASB', 'District'],
	other: ['Archive','Debug'],
}
const map = [
	['id', null, 'notificationArticleID'],
	['title', 'articleTitle', 'notificationTitle'],
	['location', null, null],
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
	['date', 'articleDate', null],
	['timestamp', 'articleUnixEpoch','notificationUnixEpoch'],
]

for(const location in locations){
	for(const category of locations[location]){
		database.ref(location).child(category).once('value', container => {
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

				article.finishConstruction()
				// Make preview
				makePreview(article)

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

function getTimestamp(){
	return Math.floor(Date.now()/1000)
}

let articles = {}
let preview
const editor = document.querySelector('.editor')

const timeAtLoad = getTimestamp()
