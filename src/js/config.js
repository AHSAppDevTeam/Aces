'use strict'
const DEBUG = true
const KEY = 'AIzaSyDEUekXeyIKJUreRaX78lsEYBt8JGHYmHE'
const defaultStory = {
	author: 'Content Editors',
	blurb: '',
	body: '',
	categoryID: '',
	date: '',
	featured: false,
	imageURLs: [],
	markdown: '',
	notifTimestamp: 0,
	notified: false,
	thumbURLs: [],
	timestamp: 0,
	title: '',
	videoIDs: [],
	views: 0
}
let user = ''
let token = ''
let secrets = {}
