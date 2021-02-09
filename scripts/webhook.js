/////////////
/* WEBHOOK */
/////////////

async function postWebhook(article){
	let diffs = []
	for(const [property] of map)
		if(article.public[property] != article.old[property])
			diffs.push(property)
	if(!diffs.length) return false

	const payload = {
		username: 'ACES edit log',
		avatar_url: 'https://internal.ahs.app/icon.png',
		content: '',
		embeds: [{
			color: 11730954,
			author: {
				name: user.email,
			},
			title: `New changes to ${article.public.title}`,
			url: `https://internal.ahs.app/editor?id=${article.public.id}`,
			description: `Modified properties: ${diffs.join(', ') || 'None'}.`,
			footer: {
				text: article.public.location + '>' + article.public.category,
			},			
		}],
	}
	const response = await fetch(
		secrets.webhook,
		{
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(payload),
		},
	)
	console.log(response)
}