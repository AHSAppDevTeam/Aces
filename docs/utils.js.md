## Functions

<dl>
<dt><a href="#rot13">rot13(string)</a> ⇒ <code>string</code></dt>
<dd><p>Shifts every character 13 places down the alphabet; swaps - and .</p>
</dd>
<dt><a href="#bracket">bracket(id, type)</a> ⇒ <code>string</code></dt>
<dd><p>Brackets an ID by its type</p>
</dd>
<dt><a href="#offset">offset()</a> ⇒ <code>number</code></dt>
<dd></dd>
<dt><a href="#timestampToDate">timestampToDate(timestamp)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#dateToTimestamp">dateToTimestamp(date)</a> ⇒ <code>number</code></dt>
<dd></dd>
<dt><a href="#randomElement">randomElement(array)</a> ⇒ <code>*</code></dt>
<dd></dd>
</dl>

<a name="rot13"></a>

## rot13(string) ⇒ <code>string</code>
Shifts every character 13 places down the alphabet; swaps - and .

**Kind**: global function  

| Param | Type |
| --- | --- |
| string | <code>string</code> | 

<a name="bracket"></a>

## bracket(id, type) ⇒ <code>string</code>
Brackets an ID by its type

**Kind**: global function  
**Returns**: <code>string</code> - bracketed ID  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| type | <code>string</code> | 

<a name="offset"></a>

## offset() ⇒ <code>number</code>
**Kind**: global function  
**Returns**: <code>number</code> - Timezone offset in seconds  
<a name="timestampToDate"></a>

## timestampToDate(timestamp) ⇒ <code>string</code>
**Kind**: global function  
**Returns**: <code>string</code> - ISO datetime string  

| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>number</code> | Unix timestamp in seconds |

<a name="dateToTimestamp"></a>

## dateToTimestamp(date) ⇒ <code>number</code>
**Kind**: global function  
**Returns**: <code>number</code> - Unix timestamp in seconds  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>string</code> | ISO datetime string |

<a name="randomElement"></a>

## randomElement(array) ⇒ <code>\*</code>
**Kind**: global function  
**Returns**: <code>\*</code> - random element of the array  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>array</code> | array |

