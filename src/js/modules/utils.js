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
const get_timestamp = async () => Math.floor(Date.now()/1000)
const rot13 = string => string.replace(/\w/g,c=>'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c)])
