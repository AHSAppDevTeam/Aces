async function fetch_json(url,request){
	const res = await fetch(
		'https://'+url+'?key='+KEY,
		{
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'applications/json' },
			method: 'POST',
		}	
	) 
	return await res.json()
}