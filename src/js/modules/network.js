const db_path = path => 'https://ahs-app.firebaseio.com/'+path+'.json'+token
async function post(path,request){
	const response = await fetch('https://'+path,
		{
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
		}	
	) 
	return await response.json()
}
async function imgbb(data){
	const body = new FormData()
	body.append('image',data)
	const response = await fetch(
		'https://'+secrets.imgbb,
		{ method: 'POST', body }
	)
	const result = await response.json()
	return {
		image: result.data.image.url,
		thumb: result.data.thumb.url,
	}
}
async function db(path,request){
	const response = await fetch(
		db_path(path),
		request ? {
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
			method: 'PATCH',
		} : {}
	)
	return await response.json()
}
async function googleapis(path,request){
	return await post(path+'?key='+KEY,request)
}
