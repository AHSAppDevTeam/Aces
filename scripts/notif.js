
///////////////////
/* NOTIFICATIONS */
///////////////////


function initMessaging() {
	messaging
		.requestPermission()
		.then(()=>messaging.getToken())
		.then(token=>messaging_token = token)
}


async function remoteNotif(article, action){

	const reference = database.ref([
		DEBUG ? 'DEBUG-notifs' : 'notifications',
		article.public.id
	].join('/'))
		
	switch(action){
		case 'publish':
			let notif_remote = {}
			
			const topic = article.public.location == 'homepage'
			? locations.indexOf(article.public.category)+1
			: article.public.location == 'bulletin'
			? article.public.location
			: null

			for(const [local,_,remote] of map)
				if(local && remote){					
					switch(local){
						case 'category':
							notif_remote[remote] = topic
							break
						default: 
							notif_remote[remote] = article.public[local]
					}
				}
			
			reference.update(notif_remote)
			
			/*
			const response = await fetch(
				'https://fcm.googleapis.com/fcm/send',
				{
					method: 'POST',
					headers: {
						'Authorization': 'key=AAAAmFLl2Hg:APA91bE_LA-QY1JMJJjQpr_HGsCkcizU3sl_uNXI2inT1LgSXGaSOMbevOjRUzITq_8e8Tk2qLioUyMUdWQ2Im-92qhbgKhLG3PvQA8luQWmBtZ2NKZgYs4dM9kwsyDC-ubb5asSM3td',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						notification: notif_remote,
						to: article.public,
					}),
				}
			)
			const result = await response.json()
			console.log(result)
			*/
			break
		case 'remove':
			reference.remove()
			break
	}
}
