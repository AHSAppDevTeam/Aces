const db_path = path => 'https://ahs-app.firebaseio.com/'+path.join('/')+'.json'+token
async function post(url,request){
	const response = await fetch('https://'+url+'?key='+KEY,
		{
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'applications/json' },
			method: 'POST',
		}	
	) 
	return await response.json()
}
async function patch_db(request,...path){
	const response = await fetch(db_path(path),
		{
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'applications/json' },
			method: 'PATCH',
		}	
	) 
	return await response.json()
}
async function db(...path){
	const response = await fetch(db_path(path))
	return await response.json()
}
const get_timestamp = async () => Math.floor(Date.now()/1000)
const rot13 = string => string.replace(/\w/g,c=>'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c)])
