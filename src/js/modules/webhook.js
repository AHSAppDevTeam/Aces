/////////////
/* WEBHOOK */
/////////////

async function postWebhook(id,title,description){
	const payload = {
		username: 'ACES edit log',
		avatar_url: 'https://internal.ahs.app/icon.png',
		content: '',
		embeds: [{
			color: 0x995eff,
			author: {
				name: 'hello',
			},
			url: 'https://editor.ahs.app/'+id,
			title,
			description,
		}],
	}
	const response = await post(await db('secrets/webhook'),payload)
	console.log(response)
}
