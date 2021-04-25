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
			console.log('put')
			if(first) {
				first = false
				dbObject[path] = payload.data
			} else {
				let modifiedPath = payload.path.split('/').filter(x=>x)
				let object = dbObject[path]
				while(modifiedPath.length>1)
				object = object[modifiedPath.shift()]
				object[modifiedPath[0]] = payload.data
				if(callback) callback()
			}
			const response = new Response()
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
