
////////////
/* REMOTE */
////////////

function remoteArticle(article, action){
	
	const old_reference = database.ref([
		DEBUG ? 'DEBUG' : article.old.location,
		article.old.category,
		article.old.id
	].join('/'))
	
	const reference = database.ref([
		DEBUG ? 'DEBUG' : article.public.location,
		article.public.category,
		article.public.id
	].join('/'))
	
	if(reference != old_reference) old_reference.remove()

	switch(action){
		case 'publish':
			if(article.public.title=='Untitled Article') return

			let article_remote = {}

			for(const [local,remote,_] of map)
				if(local && remote)
					article_remote[remote] = article.public[local]
					
			reference.update(article_remote)
			article.published = true
			
			remoteNotif(article,article.public.notify ? 'publish' : 'remove')
			postWebhook(article)
			
			article.old = Object.assign({},article.public)
			break
		case 'remove':
			reference.remove()
			article.published = false
			break
	}
}

async function remoteNotif(article, action){

	const reference = database.ref([
		DEBUG ? 'DEBUG-notifs' : 'notifications',
		article.public.id
	].join('/'))
		
	switch(action){
		case 'publish':
			// Upload notification to Realtime Database
			let notif_remote = {}
			
			const topic = article.public.location == 'homepage'
			? article.public.category
			: article.public.location

			const topicIndex = article.public.location == 'homepage'
			? locations.indexOf(article.public.category)+1
			: article.public.location == 'bulletin'
			? 4
			: null

			for(const [local,_,remote] of map)
				if(local && remote){					
					switch(local){
						case 'category':
							notif_remote[remote] = topicIndex
							break
						default: 
							notif_remote[remote] = article.public[local]
					}
				}
			
			reference.update(notif_remote)
			
			// Send push notification to FCM
			const payload = {
				notification:{
					title: article.public.title,
					body: article.public.notification,
				},
				data:{
					articleID: article.public.id, 
					to: '/topics/'+topic,
				},
			}
			const response = await fetch(
				'https://fcm.googleapis.com/fcm/send',
				{
					method: 'POST',
					headers: {
						'Authorization': secrets.messaging,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				}
			)
			console.log(response)
			break
		case 'remove':
			reference.remove()
			break
	}
}
