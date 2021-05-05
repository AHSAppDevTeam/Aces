const typography = text => text
		// Smart quotes
		/* opening singles */
		.replace(/(^|[-\u2014\s(\["])'/g,'$1&lsquo;')
		/* closing singles & apostrophes */
		.replace(/'/g,'&rsquo;')
		/* opening doubles */
		.replace(/(^|[-\u2014/\[(\u2018\s])"/g,'$1&ldquo;')
		/* closing doubles */
		.replace(/"/g,'&rdquo;')
	// Dashes
		/* em-dashes */
		.replace(/\s--\s?/g,'&thinsp;&mdash;&thinsp;')
		/* en-dashes */
		.replace(/--/g,'&ndash;')
