"use strict"

const DEBUG = false

//////////
/* INIT */
//////////

const database = firebase.database()
const messaging=firebase.messaging()
let messaging_token

const locations = {
	bulletin: ['Academics', 'Athletics', 'Clubs', 'Colleges', 'Reference'],
	homepage: ['ASB', 'District', 'General_Info'],
	debug: ['DEBUG'],
}
const map = [
	['id', null, 'articleNotificationID'],
	['title', 'articleTitle', 'notificationTitle'],
	['category', null, 'notificationCategory'],
	['images', 'articleImages', null],
	['videos', 'articleVideoIDs', null],
	['author', 'articleAuthor', null],
	['body', 'articleBody', null],
	['md', 'articleMd', null],
	['hasHTML', 'hasHTML', null],
	['feature', 'isFeatured', null],
	['notify', 'isNotified', null],
	['notif', null, 'notificationBody'],
	['timestamp', 'articleUnixEpoch','notificationUnixEpoch'],
]

for(const location in locations){
	for(const category of locations[location]){
		database.ref(location).child(category).orderByChild('articleUnixEpoch').once('value', container => {
			container.forEach(snapshot => {
				// Save article to custom format
				let article = new Article(snapshot.key)
				const article_remote = snapshot.val()

				// Transfer public properties to local format
				article.public.location = location
				article.public.category = category
				for (const [local, remote, _] of map)
					if(article_remote[remote])
						article.public[local] = article_remote[remote]

				// Use HTML if markdown isn't available
				article.public.md = article.public.md || article.public.body

				// Make preview
				makePreview(article, 1)

				article.published = true
			})
		})
	}
}

database.ref('notifications').once('value', container=>{
	container.forEach(snapshot => {
		const notif_remote = snapshot.val()
		const article = articles[notif_remote.notificationArticleID]
		if(article){
			article.public.notify = true
			for(const [local, _, remote] of map)
				if(notif_remote[remote] && !article.public[local])
					article.public[local] = notif_remote[remote]
		}
	})
})


let articles = {}
let editor, preview


////////////
/* SEARCH */
////////////

const search = document.querySelector('.search')
const regex = /{(\w+) (.*?)}/g
search.addEventListener('input',async event=>{
	const query = search.value
	const tags = Array.from(query.matchAll(regex))
	const rest = query.replaceAll(regex,'').trim()
	for await(const article of Object.values(articles))
		article.preview.hidden = !(await matchArticle(article,tags,rest))
})
async function matchArticle(article,tags,rest){
	if(!article.public.md.toLowerCase().includes(rest))
		return false
	for(const [_,name,parameters] of tags)
		for(const parameter of parameters.toLowerCase().split('|'))
			if(!article.public[name].toString().toLowerCase().includes(parameter.trim()))
				return false
	return true
}

////////////
/* RESIZE */
////////////

const resize = document.querySelector('.resize')
resize.addEventListener('pointerdown',_=>{
	document.body.style.pointerEvents = document.body.style.userSelect = 'none'
	resize.focus()
	window.addEventListener('pointerup',event=>{
		editor.style.width = event.x/window.innerWidth*100+'vw'
		document.body.style.pointerEvents = document.body.style.userSelect = 'auto'
		resize.blur()
	}, {once:true})
})

////////////
/* EDITOR */
////////////

const Editor = document.querySelector('.template-editor')
const Image = document.querySelector('.template-image')

function clearEditor(){

	// Replace previous editor with fresh template
	let width
	if(editor) {
		width = editor.style.width
		document.body.removeChild(editor)
	}
	editor = Editor.content.cloneNode(true).querySelector('main')
	if(width) editor.style.width = width
	document.body.prepend(editor)

	// Copy-able ID
	editor.querySelector('.id').addEventListener('click', event=>{
		event.target.select()
		document.execCommand('copy')
		event.target.setSelectionRange(0,0)
		event.target.blur()
	})
}

function makeEditor(article) {

	clearEditor()
	// Mark current article as open
	if(preview) preview.classList.remove('open')
	preview = article.preview
	preview.classList.add('open')
	
	{
		const timestamp_seconds = article.public.timestamp
		const local_offset_minutes = new Date().getTimezoneOffset()
		const local_timestamp_seconds = timestamp_seconds - local_offset_minutes*60
		article.public.date = new Date(local_timestamp_seconds*1000).toISOString().slice(0,10)
	}
	
	for (const property in article.public) {
		updateProperty(editor,article,property)
	}

	for(const url of article.public.images) {
		makeMedia(article,url,false)
	}

	editor.addEventListener('input',event=>{
		const property = event.target.classList[0]
		if(!(property in article.public)) return

		article.public[property] = elementContent(event.target)

		switch(property){
			case 'md':
				// Render HTML version of the Markdown text
				article.public.md = article.public.md.replace('\n\n\n','\n\n') // fix weird newline bug
				article.public.body = renderMarkdown(article.public.md)
				updateProperty(editor,article,'body')
				break
			case 'category':
				// Assign the location of the category to the article
				article.public.location = Object
					.keys(locations)
					.find(location => locations[location].includes(article.public.category))
				break
			case 'date':
				const timestamp_seconds = Math.floor(Date.parse(article.public.date)/1000)
				const local_offset_minutes = new Date().getTimezoneOffset()
				const local_timestamp_seconds = timestamp_seconds + local_offset_minutes*60

				article.public.timestamp = local_timestamp_seconds
				break
		}

		article.published = false
		updatePreview(article)
	})

	// Add media via URL
	editor
		.querySelector('.url')
		.addEventListener('change',event=>{
		const url = event.target.value
		makeMedia(article,url,true)

		event.target.value = ''
		article.published = false
		updatePreview(article)
	})

	// Add media via upload
	editor
		.querySelector('.upload>input')
		.addEventListener('change',async event=>{
		for(const file of event.target.files){
			if(!file.type.startsWith('image/')) continue // Skip if not an image

			const body = new FormData()
			body.append('image',file)

			const response = await fetch(
				'https://api.imgbb.com/1/upload?key=f4cd106d84c863d956aa719ab531078e',
				{
					method: 'POST',
					body,
				}
			)
			const result = await response.json()
			const url = result.data.url

			makeMedia(article,url,true)
		}

		event.target.files = []
		article.published = false
		updatePreview(article)
	})

	// Remove / publish article
	for(const action of ['remove','publish'])
		editor
			.querySelector('.'+action)
			.addEventListener('click', _=> remoteArticle(article,action))

	// Toggle rendered article
	editor
		.querySelector('.render')
		.addEventListener('click',async event=>{
		const previewing = event.target.value == 'Preview'
		event.target.value = previewing ? 'Edit' : 'Preview'
		editor.classList.toggle('render',previewing)
	})
}

function typography(text) {
	return text
	// Smart quotes
	
	/* opening singles */
		.replace(/(^|[-\u2014\s(\["])'/g, '$1\u2018')

	/* closing singles & apostrophes */
		.replace(/'/g, '\u2019')

	/* opening doubles */
		.replace(/(^|[-\u2014/\[(\u2018\s])"/g, '$1\u201c')

	/* closing doubles */
		.replace(/"/g, '\u201d')

  // Dashes
	/* em-dashes */
		.replace(/--/g, '\u2014');
}

function renderMarkdown(text) {
	return marked(typography(text))
}

function updateProperty(editor,article,property){
	const element = editor.querySelector('.'+property)
	if (element)
		element[elementProperty(element)] = article.public[property]
}

function elementProperty(element){
	return ['checkbox'].includes(element.type) ? 'checked'
	: ['INPUT','SELECT'].includes(element.tagName) ? 'value'
	: element.className.includes('body') ? 'innerHTML'
	: 'innerText'
}

function elementContent(element){
	return element[elementProperty(element)]
}

function makeMedia(article,url,novel=false){

	let location = 'images'
	let id = url
	const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)(\w+)/)
	const media = editor.querySelector('.media')
	
	if(youtube){
		id = youtube[1]
		url = `https://img.youtube.com/vi/${id}/sddefault.jpg` // thumbnail
		location = 'videos'
	}
	
	if(novel) article.public[location].push(id)
	
	const image = Image.content.cloneNode(true).querySelector('section')
	
	image.id = id
	image.querySelector('img').src = url

	image.querySelector('.delete').addEventListener('click',_=>{
		const index = article.public[location].indexOf(id)
		article.public[location].splice(index,1)
		image.remove()
		article.published = false
	})
	
	image.addEventListener('dragover',event=>{
		event.preventDefault()
	},false)
	image.addEventListener('dragstart',event=>{
		image.classList.add('dragged')
	},false)
	image.addEventListener('drop',event=>{
		const dragged = media.querySelector('.dragged')
		dragged.classList.remove('dragged')
		media.insertBefore(image,dragged)
		
		const oldIndex = article.public[location].indexOf(dragged.id)
		const newIndex = article.public[location].indexOf(id)
		
		article.public[location].splice(oldIndex,1)
		article.public[location].splice(newIndex,0,dragged.id)
	},false)

	image.classList.add('image')
	media.append(image)
}

/////////////
/* PREVIEW */
/////////////

const Preview = document.querySelector('.template-preview')
const previewContainer = document.querySelector('.browser')

function makePreview(article,order){
	// Load article properties into a preview
	const preview = Preview.content.cloneNode(true).querySelector('button')
	article.preview = preview

	updatePreview(article)

	// Background image
	if(article.public.images.length) preview.style.backgroundImage = `linear-gradient(var(--cover),var(--cover)), url(${article.public.images[0]})`

	preview.addEventListener('click', _=> makeEditor(article))
	preview.style.order = order

	previewContainer.prepend(preview)
}

function updatePreview(article){
	for (const property in article.public) {
		const element = article.preview.querySelector('.'+property)
		let val = article.public[property]
		if(typeof val == 'string') val = val.substring(0,300)
		if (element) element.innerHTML = val
	}
}

/////////////
/* ARTICLE */
/////////////

class Article {
	constructor (id) {
		this.media = []
		this.public = { // Data to be passed to the server
			id: id  || makeID(),
			location: 'homepage',
			category: 'General_Info',
			title: 'Untitled Article',
			author: '',
			md: '',
			hasHTML: true,
			feature: false,
			notify: false,
			notif: '',
			timestamp: Math.floor(Date.now()/1000),
			body: '',
			images: [],
			videos: [],
		}
		articles[this.public.id] = this
	}

	set published (state) {
		this._published = state
		if(this.preview)
			this.preview.classList.toggle('published',state)
	}
	get published () {
		return this._published
	}
}

document.querySelector('.new-article').addEventListener('click',makeArticle)
makeArticle()

function makeArticle() {
	let article = new Article()
	article.published = false
	article.public.md = `Type stuff here!

Two presses of the enter key makes a new paragraph.

Words can be **bolded** or *italicized* like so.

Links look like [this](https://example.com).

"Quotes shall be made curly" -- And 2 normal dashes will be turned into a long em-dash.

Click on **Preview** to view the formatted article.

> This is a block quote

HTML <s>tags</s> are fine too.

For more info check out [an overview of Markdown](https://www.markdownguide.org/basic-syntax).`
	article.public.body = renderMarkdown(article.public.md)
	article.public.author =  'Alice Bobson'
	article.public.notif = 'Click the "notify" checkbox, then "publish", to push this text as a notification.'
	makePreview(article, 0)
	makeEditor(article)
}

function makeID(){
	// Gfycat-like human-friendly ID generator
	const adjectives = `abandoned,able,absolute,adorable,adventurous,academic,acceptable,acclaimed,accomplished,accurate,aching,acidic,acrobatic,active,actual,adept,admirable,admired,adolescent,adorable,adored,advanced,afraid,affectionate,aged,aggravating,aggressive,agile,agitated,agonizing,agreeable,ajar,alarmed,alarming,alert,alienated,alive,all,altruistic,amazing,ambitious,ample,amused,amusing,anchored,ancient,angelic,angry,anguished,animated,annual,another,antique,anxious,any,apprehensive,appropriate,apt,arctic,arid,aromatic,artistic,ashamed,assured,astonishing,athletic,attached,attentive,attractive,austere,authentic,authorized,automatic,avaricious,average,aware,awesome,awful,awkward,babyish,bad,back,baggy,bare,barren,basic,beautiful,belated,beloved,beneficial,better,best,bewitched,big,big-hearted,biodegradable,bite-sized,bitter,black,black-and-white,bland,blank,blaring,bleak,blind,blissful,blond,blue,blushing,bogus,boiling,bold,bony,boring,bossy,both,bouncy,bountiful,bowed,brave,breakable,brief,bright,brilliant,brisk,broken,bronze,brown,bruised,bubbly,bulky,bumpy,buoyant,burdensome,burly,bustling,busy,buttery,buzzing,calculating,calm,candid,canine,capital,carefree,careful,careless,caring,cautious,cavernous,celebrated,charming,cheap,cheerful,cheery,chief,chilly,chubby,circular,classic,clean,clear,clear-cut,clever,close,closed,cloudy,clueless,clumsy,cluttered,coarse,cold,colorful,colorless,colossal,comfortable,common,compassionate,competent,complete,complex,complicated,composed,concerned,concrete,confused,conscious,considerate,constant,content,conventional,cooked,cool,cooperative,coordinated,corny,corrupt,costly,courageous,courteous,crafty,crazy,creamy,creative,creepy,criminal,crisp,critical,crooked,crowded,cruel,crushing,cuddly,cultivated,cultured,cumbersome,curly,curvy,cute,cylindrical,damaged,damp,dangerous,dapper,daring,darling,dark,dazzling,dead,deadly,deafening,dear,dearest,decent,decimal,decisive,deep,defenseless,defensive,defiant,deficient,definite,definitive,delayed,delectable,delicious,delightful,delirious,demanding,dense,dental,dependable,dependent,descriptive,deserted,detailed,determined,devoted,different,difficult,digital,diligent,dim,dimpled,dimwitted,direct,disastrous,discrete,disfigured,disgusting,disloyal,dismal,distant,downright,dreary,dirty,disguised,dishonest,dismal,distant,distinct,distorted,dizzy,dopey,doting,double,downright,drab,drafty,dramatic,dreary,droopy,dry,dual,dull,dutiful,each,eager,earnest,early,easy,easy-going,ecstatic,edible,educated,elaborate,elastic,elated,elderly,electric,elegant,elementary,elliptical,embarrassed,embellished,eminent,emotional,empty,enchanted,enchanting,energetic,enlightened,enormous,enraged,entire,envious,equal,equatorial,essential,esteemed,ethical,euphoric,even,evergreen,everlasting,every,evil,exalted,excellent,exemplary,exhausted,excitable,excited,exciting,exotic,expensive,experienced,expert,extraneous,extroverted,extra-large,extra-small,fabulous,failing,faint,fair,faithful,fake,false,familiar,famous,fancy,fantastic,far,faraway,far-flung,far-off,fast,fat,fatal,fatherly,favorable,favorite,fearful,fearless,feisty,feline,female,feminine,few,fickle,filthy,fine,finished,firm,first,firsthand,fitting,fixed,flaky,flamboyant,flashy,flat,flawed,flawless,flickering,flimsy,flippant,flowery,fluffy,fluid,flustered,focused,fond,foolhardy,foolish,forceful,forked,formal,forsaken,forthright,fortunate,fragrant,frail,frank,frayed,free,French,fresh,frequent,friendly,frightened,frightening,frigid,frilly,frizzy,frivolous,front,frosty,frozen,frugal,fruitful,full,fumbling,functional,funny,fussy,fuzzy,gargantuan,gaseous,general,generous,gentle,genuine,giant,giddy,gigantic,gifted,giving,glamorous,glaring,glass,gleaming,gleeful,glistening,glittering,gloomy,glorious,glossy,glum,golden,good,good-natured,gorgeous,graceful,gracious,grand,grandiose,granular,grateful,grave,gray,great,greedy,green,gregarious,grim,grimy,gripping,grizzled,gross,grotesque,grouchy,grounded,growing,growling,grown,grubby,gruesome,grumpy,guilty,gullible,gummy,hairy,half,handmade,handsome,handy,happy,happy-go-lucky,hard,hard-to-find,harmful,harmless,harmonious,harsh,hasty,hateful,haunting,healthy,heartfelt,hearty,heavenly,heavy,hefty,helpful,helpless,hidden,hideous,high,high-level,hilarious,hoarse,hollow,homely,honest,honorable,honored,hopeful,horrible,hospitable,hot,huge,humble,humiliating,humming,humongous,hungry,hurtful,husky,icky,icy,ideal,idealistic,identical,idle,idiotic,idolized,ignorant,ill,illegal,ill-fated,ill-informed,illiterate,illustrious,imaginary,imaginative,immaculate,immaterial,immediate,immense,impassioned,impeccable,impartial,imperfect,imperturbable,impish,impolite,important,impossible,impractical,impressionable,impressive,improbable,impure,inborn,incomparable,incompatible,incomplete,inconsequential,incredible,indelible,inexperienced,indolent,infamous,infantile,infatuated,inferior,infinite,informal,innocent,insecure,insidious,insignificant,insistent,instructive,insubstantial,intelligent,intent,intentional,interesting,internal,international,intrepid,ironclad,irresponsible,irritating,itchy,jaded,jagged,jam-packed,jaunty,jealous,jittery,joint,jolly,jovial,joyful,joyous,jubilant,judicious,juicy,jumbo,junior,jumpy,juvenile,kaleidoscopic,keen,key,kind,kindhearted,kindly,klutzy,knobby,knotty,knowledgeable,knowing,known,kooky,kosher,lame,lanky,large,last,lasting,late,lavish,lawful,lazy,leading,lean,leafy,left,legal,legitimate,light,lighthearted,likable,likely,limited,limp,limping,linear,lined,liquid,little,live,lively,livid,loathsome,lone,lonely,long,long-term,loose,lopsided,lost,loud,lovable,lovely,loving,low,loyal,lucky,lumbering,luminous,lumpy,lustrous,luxurious,mad,made-up,magnificent,majestic,major,male,mammoth,married,marvelous,masculine,massive,mature,meager,mealy,mean,measly,meaty,medical,mediocre,medium,meek,mellow,melodic,memorable,menacing,merry,messy,metallic,mild,milky,mindless,miniature,minor,minty,miserable,miserly,misguided,misty,mixed,modern,modest,moist,monstrous,monthly,monumental,moral,mortified,motherly,motionless,mountainous,muddy,muffled,multicolored,mundane,murky,mushy,musty,muted,mysterious,naive,narrow,nasty,natural,naughty,nautical,near,neat,necessary,needy,negative,neglected,negligible,neighboring,nervous,new,next,nice,nifty,nimble,nippy,nocturnal,noisy,nonstop,normal,notable,noted,noteworthy,novel,noxious,numb,nutritious,nutty,obedient,obese,oblong,oily,oblong,obvious,occasional,odd,oddball,offbeat,offensive,official,old,old-fashioned,only,open,optimal,optimistic,opulent,orange,orderly,organic,ornate,ornery,ordinary,original,other,our,outlying,outgoing,outlandish,outrageous,outstanding,oval,overcooked,overdue,overjoyed,overlooked,palatable,pale,paltry,parallel,parched,partial,passionate,past,pastel,peaceful,peppery,perfect,perfumed,periodic,perky,personal,pertinent,pesky,pessimistic,petty,phony,physical,piercing,pink,pitiful,plain,plaintive,plastic,playful,pleasant,pleased,pleasing,plump,plush,polished,polite,political,pointed,pointless,poised,poor,popular,portly,posh,positive,possible,potable,powerful,powerless,practical,precious,present,prestigious,pretty,precious,previous,pricey,prickly,primary,prime,pristine,private,prize,probable,productive,profitable,profuse,proper,proud,prudent,punctual,pungent,puny,pure,purple,pushy,putrid,puzzled,puzzling,quaint,qualified,quarrelsome,quarterly,queasy,querulous,questionable,quick,quick-witted,quiet,quintessential,quirky,quixotic,quizzical,radiant,ragged,rapid,rare,rash,raw,recent,reckless,rectangular,ready,real,realistic,reasonable,red,reflecting,regal,regular,reliable,relieved,remarkable,remorseful,remote,repentant,required,respectful,responsible,repulsive,revolving,rewarding,rich,rigid,right,ringed,ripe,roasted,robust,rosy,rotating,rotten,rough,round,rowdy,royal,rubbery,rundown,ruddy,rude,runny,rural,rusty,sad,safe,salty,same,sandy,sane,sarcastic,sardonic,satisfied,scaly,scarce,scared,scary,scented,scholarly,scientific,scornful,scratchy,scrawny,second,secondary,second-hand,secret,self-assured,self-reliant,selfish,sentimental,separate,serene,serious,serpentine,several,severe,shabby,shadowy,shady,shallow,shameful,shameless,sharp,shimmering,shiny,shocked,shocking,shoddy,short,short-term,showy,shrill,shy,sick,silent,silky,silly,silver,similar,simple,simplistic,sinful,single,sizzling,skeletal,skinny,sleepy,slight,slim,slimy,slippery,slow,slushy,small,smart,smoggy,smooth,smug,snappy,snarling,sneaky,sniveling,snoopy,sociable,soft,soggy,solid,somber,some,spherical,sophisticated,sore,sorrowful,soulful,soupy,sour,Spanish,sparkling,sparse,specific,spectacular,speedy,spicy,spiffy,spirited,spiteful,splendid,spotless,spotted,spry,square,squeaky,squiggly,stable,staid,stained,stale,standard,starchy,stark,starry,steep,sticky,stiff,stimulating,stingy,stormy,straight,strange,steel,strict,strident,striking,striped,strong,studious,stunning,stupendous,stupid,sturdy,stylish,subdued,submissive,substantial,subtle,suburban,sudden,sugary,sunny,super,superb,superficial,superior,supportive,sure-footed,surprised,suspicious,svelte,sweaty,sweet,sweltering,swift,sympathetic,tall,talkative,tame,tan,tangible,tart,tasty,tattered,taut,tedious,teeming,tempting,tender,tense,tepid,terrible,terrific,testy,thankful,that,these,thick,thin,third,thirsty,this,thorough,thorny,those,thoughtful,threadbare,thrifty,thunderous,tidy,tight,timely,tinted,tiny,tired,torn,total,tough,traumatic,treasured,tremendous,tragic,trained,tremendous,triangular,tricky,trifling,trim,trivial,troubled,true,trusting,trustworthy,trusty,truthful,tubby,turbulent,twin,ugly,ultimate,unacceptable,unaware,uncomfortable,uncommon,unconscious,understated,unequaled,uneven,unfinished,unfit,unfolded,unfortunate,unhappy,unhealthy,uniform,unimportant,unique,united,unkempt,unknown,unlawful,unlined,unlucky,unnatural,unpleasant,unrealistic,unripe,unruly,unselfish,unsightly,unsteady,unsung,untidy,untimely,untried,untrue,unused,unusual,unwelcome,unwieldy,unwilling,unwitting,unwritten,upbeat,upright,upset,urban,usable,used,useful,useless,utilized,utter,vacant,vague,vain,valid,valuable,vapid,variable,vast,velvety,venerated,vengeful,verifiable,vibrant,vicious,victorious,vigilant,vigorous,villainous,violet,violent,virtual,virtuous,visible,vital,vivacious,vivid,voluminous,wan,warlike,warm,warmhearted,warped,wary,wasteful,watchful,waterlogged,watery,wavy,wealthy,weak,weary,webbed,wee,weekly,weepy,weighty,weird,welcome,well-documented,well-groomed,well-informed,well-lit,well-made,well-off,well-to-do,well-worn,wet,which,whimsical,whirlwind,whispered,white,whole,whopping,wicked,wide,wide-eyed,wiggly,wild,willing,wilted,winding,windy,winged,wiry,wise,witty,wobbly,woeful,wonderful,wooden,woozy,wordy,worldly,worn,worried,worrisome,worse,worst,worthless,worthwhile,worthy,wrathful,wretched,writhing,wrong,wry,yawning,yearly,yellow,yellowish,young,youthful,yummy,zany,zealous,zesty,zigzag`
	.split(',')
	const animals = `aardvark,albatross,alligator,alpaca,ant,anteater,antelope,ape,armadillo,baboon,badger,barracuda,bat,bear,beaver,bee,bird,bison,boar,butterfly,camel,caribou,cassowary,cat,caterpillar,cattle,chamois,cheetah,chicken,chimpanzee,chinchilla,chough,coati,cobra,cockroach,cod,cormorant,coyote,crab,crocodile,crow,curlew,deer,dinosaur,dog,dolphin,donkey,dotterel,dove,dragonfly,duck,dugong,dunlin,eagle,echidna,eel,elephant,elk,emu,falcon,ferret,finch,fish,flamingo,fly,fox,frog,gaur,gazelle,gerbil,giraffe,gnat,goat,goose,gorilla,goshawk,grasshopper,grouse,guanaco,gull,hamster,hare,hawk,hedgehog,heron,herring,hippopotamus,hornet,horse,hummingbird,hyena,ibex,ibis,jackal,jaguar,jay,jellyfish,kangaroo,kinkajou,koala,kouprey,kudu,lapwing,lark,lemur,leopard,lion,llama,lobster,locust,loris,louse,lyrebird,magpie,mallard,manatee,mandrill,mink,mongoose,monkey,moose,mouse,mosquito,narwhal,newt,nightingale,octopus,okapi,opossum,ostrich,otter,owl,oyster,parrot,panda,partridge,peafowl,pelican,penguin,pheasant,pork,pigeon,pony,porcupine,porpoise,quail,quelea,quetzal,rabbit,raccoon,rat,raven,reindeer,rhinoceros,salamander,salmon,sandpiper,sardine,seahorse,shark,sheep,shrew,skunk,sloth,snail,snake,spider,squirrel,starling,swan,tapir,tarsier,termite,tiger,toad,turtle,wallaby,walrus,wasp,weasel,whale,wolf,wolverine,wombat,wren,yak,zebra`
	.split(',')
	
	return [randomElement(adjectives),randomElement(adjectives),randomElement(animals)].join('-')
}

function randomElement(array){
	return array[Math.floor(Math.random()*array.length)]
}

function remoteArticle(article, action){
	const location = DEBUG ? 'DEBUG' : article.public.location

	const reference = database.ref([null,location,article.public.category,article.public.id].join('/'))

	switch(action){
		case 'publish':
			let article_remote = {}

			for(const [local,remote,_] of map)
				if(local && remote)
					article_remote[remote] = article.public[local]
					
			reference.update(article_remote)
			article.published = true
			
			remoteNotif(article,article.public.notify ? 'publish' : 'remove')
			break
			
		case 'remove':
			reference.remove()
			article.published = false
			break
	}	
}

///////////////////
/* NOTIFICATIONS */
///////////////////


function initMessaging() {
	messaging
		.requestPermission()
		.then(()=>messaging.getToken())
		.then(token=>messaging_token = token)
}


function remoteNotif(article, action){
	const location = DEBUG ? 'DEBUG-notifs' : 'notifications'

	const reference = database.ref([null,location,article.public.id].join('/'))
		
	switch(action){
		case 'publish':
			let notif_remote = {}

			for(const [local,_,remote] of map)
				if(local && remote)
					notif_remote[remote] = article.public[local]
					
			reference.update(notif_remote)
			break
		case 'remove':
			reference.remove()
			break
	}
}
