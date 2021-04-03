async function postWebhook(id,title,description){
	const payload = {
		username: 'Aces',
		avatar_url: 'https://edit.ahs.app/icon.png',
		content: '',
		embeds: [{
			color: 0x995eff,
			author: {
				name: user,
			},
			url: 'https://editor.ahs.app/'+rot13(id),
			title,
			description,
		}],
	}
	const response = await post(secrets.webhook,payload)
	console.log(response)
}
