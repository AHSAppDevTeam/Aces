const typography = text => text
		// Smart quotes
		/* opening singles */
		.replace(/(^|[-\u2014\s(\["])'/g,'$1‘')
		/* closing singles & apostrophes */
		.replace(/'/g,'’')
		/* opening doubles */
		.replace(/(^|[-\u2014/\[(\u2018\s])"/g,'$1“')
		/* closing doubles */
		.replace(/"/g,'”')
	// Dashes
		/* em-dashes */
		.replace(/\s--\s?/g,' — ')
		/* en-dashes */
		.replace(/--/g,'–')
