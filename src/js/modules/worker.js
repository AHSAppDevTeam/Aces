async function initWorker(){
	if (!('serviceWorker' in navigator)) return
	// navigator.serviceWorker.register('/worker.js')
	navigator.serviceWorker.subscriptionList = { }
	navigator.serviceWorker.addEventListener('message', ({data:{type,path}}) => {
		console.log(data)
		const list = navigator.serviceWorker.subscriptionList
		if(type=='update' && path in list) (list[path])()
	})
	navigator.serviceWorker.getRegistrations().then(function (registrations) {
		for (const registration of registrations) {
			// unregister service worker
			console.log('serviceWorker unregistered')
			registration.unregister()
		}
	})
}
