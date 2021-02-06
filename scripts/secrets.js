/////////////
/* SECRETS */
/////////////

const secrets = {
	imgbb: '',
	webhook: '',
}

function updateSecrets(){
	database.ref('secrets').once('value',container => {
		container.forEach(snapshot => {
			secrets[snapshot.key] = snapshot.val()
		})
	})
}