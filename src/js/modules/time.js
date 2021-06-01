const timestamp = () => Math.floor(Date.now()/1000/60)*60

/**
 * 
 * @returns {number} Timezone offset in seconds
 */
 const timezoneOffset = () => new Date().getTimezoneOffset()*60

 /**
  * 
  * @param {number} timestamp Unix timestamp in seconds 
  * @returns {Date} Date object
  */
 const timestampToLocalDate = timestamp => new Date((parseInt(timestamp) - timezoneOffset())*1000)
 
 const timestampToLocalISOString = timestamp => timestampToLocalDate(timestamp).toISOString().slice(0,19)
 
 const timestampToLocalHumanString = timestamp => timestampToLocalDate(timestamp).toLocaleDateString(undefined, {
	 weekday: 'long',
	 month: 'long',
	 day: 'numeric'
 })
 
 /**
  * 
  * @param {string} ISOString ISO datetime string
  * @returns {number} Unix timestamp in seconds 
  */
 const LocalISOStringToTimestamp = ISOString => Math.floor(new Date(ISOString+'Z').getTime()/1000) + timezoneOffset()
 