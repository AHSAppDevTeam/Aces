/**
 * Sends a message to the Discord channel
 * @param {string} id 
 * @param {string} title 
 * @param {string} description 
 */
async function discord(id='',title='',description=''){
	const payload = {
		username: 'Aces',
		avatar_url: 'https://edit.ahs.app/icon.png',
		content: '',
		embeds: [{
			color: 0x995eff,
			author: {
				name: user.slice(0,256),
			},
			url: 'https://edit.ahs.app/'+id,
			title: title.slice(0,256),
			description: description.slice(0,2048),
		}],
	}
	const response = await post((await dbOnce('secrets/webhook')),payload)
}
