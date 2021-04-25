async function initWorker(){
	if ('serviceWorker' in navigator)
		navigator.serviceWorker.register('/worker.js')
}
self.addEventListener('fetch', event => {
	// Process only dbLive requests
	if (event.request.headers.get('Aces-Accept') !== 'text/event-stream') return
	const cached = await caches.match(event.request)
	event.respondWith(cached || await new Promise((resolve)=>{
		const source = new EventSource(event.request.url)
		let first = true
		source.addEventListener('put', ({data})=>{
			console.log(data)
			const payload = JSON.parse(data)
			let responseObject = payload.data
			if(first) {
				first = false
			} else {
				const cached = await caches.match(event.request)
				responseObject = await cached.json()
				
				let modifiedPath = payload.path.split('/').filter(x=>x)
				while(modifiedPath.length>1)
					responseObject = responseObject[modifiedPath.shift()]
				responseObject[modifiedPath[0]] = payload.data
			}
			const response = new Response(JSON.stringify(responseObject))
			const cache = await caches.open('v1')
			cache.put(event.request, response.clone())
			resolve(response)
		})
		window.addEventListener('beforeunload', () => {
			source.close()
		})			
	}))
})

self.addEventListener('install', (evt) => evt.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (evt) => evt.waitUntil(self.clients.claim()));
