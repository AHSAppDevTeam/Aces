/////////////
/* SECRETS */
/////////////

const secrets = {
	imgbb: '',
	webhook: '',
	messaging: '',
}

function updateSecrets(){
	for(const key of secrets)
		database.ref('secrets/'+key).once('value',
			snapshot=>secrets[key]=snapshot.val()
		)
}