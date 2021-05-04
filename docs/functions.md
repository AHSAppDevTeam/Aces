## Functions

<dl>
<dt><a href="#initAuth">initAuth()</a></dt>
<dd><p>Initiates the authentication elements</p>
</dd>
<dt><a href="#signInWithEmail">signInWithEmail(email, password)</a></dt>
<dd><p>Sign in to Firebase with email and password</p>
</dd>
<dt><a href="#signInWithToken">signInWithToken(refreshToken)</a></dt>
<dd><p>Sign in to Firebase with stored refresh token</p>
</dd>
<dt><a href="#signOut">signOut()</a></dt>
<dd><p>Sign out of Firebase</p>
</dd>
<dt><a href="#discord">discord(id, title, description)</a></dt>
<dd><p>Sends a message to the Discord webhook</p>
</dd>
<dt><a href="#$">$(query, parent)</a> ⇒ <code>Element</code></dt>
<dd><p>Shortcut for querySelector</p>
</dd>
<dt><a href="#$$">$$(query, parent)</a> ⇒ <code>Array.&lt;Element&gt;</code></dt>
<dd><p>Shortcut for querySelectorAll</p>
</dd>
<dt><a href="#$template">$template(id)</a> ⇒ <code>Element</code></dt>
<dd><p>Clones a template element</p>
</dd>
<dt><a href="#makeID">makeID()</a> ⇒ <code>string</code></dt>
<dd><p>Gfycat-like human-friendly ID generator</p>
</dd>
<dt><a href="#post">post(path, request)</a> ⇒ <code>json</code></dt>
<dd><p>Sends an HTTP GET request</p>
</dd>
<dt><a href="#imgbb">imgbb(data)</a> ⇒ <code><a href="#urlSet">urlSet</a></code></dt>
<dd><p>Uploads an image to ImgBB.com</p>
</dd>
<dt><a href="#dbPath">dbPath(path, legacy)</a> ⇒ <code>string</code></dt>
<dd><p>Expands relative path to Firebase realtime database URL</p>
</dd>
<dt><a href="#dbOnce">dbOnce(path)</a> ⇒ <code>Promise</code></dt>
<dd><p>Reads the database once</p>
</dd>
<dt><a href="#dbLive">dbLive(path)</a> ⇒ <code>Promise</code></dt>
<dd><p>Reads the database and updates it live</p>
</dd>
<dt><a href="#dbWrite">dbWrite(path, body, legacy)</a> ⇒ <code>Promise</code></dt>
<dd><p>Writes to the database</p>
</dd>
<dt><a href="#googleapis">googleapis(path, request)</a> ⇒ <code>Promise</code></dt>
<dd></dd>
<dt><a href="#initResize">initResize()</a></dt>
<dd><p>Initiates the resize bar</p>
</dd>
<dt><a href="#initTextarea">initTextarea($textarea)</a></dt>
<dd><p>Initiates a textarea</p>
</dd>
<dt><a href="#dispatchInput">dispatchInput($textarea)</a></dt>
<dd><p>Programmatically trigger the &#39;input&#39; event on a textarea</p>
</dd>
<dt><a href="#remapEnter">remapEnter($input)</a></dt>
<dd><p>Assign the enter key to trigger the &#39;change&#39; event</p>
</dd>
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

## Typedefs

<dl>
<dt><a href="#urlSet">urlSet</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="initAuth"></a>

## initAuth()
Initiates the authentication elements

**Kind**: global function  
<a name="signInWithEmail"></a>

## signInWithEmail(email, password)
Sign in to Firebase with email and password

**Kind**: global function  

| Param | Type |
| --- | --- |
| email | <code>string</code> | 
| password | <code>string</code> | 

<a name="signInWithToken"></a>

## signInWithToken(refreshToken)
Sign in to Firebase with stored refresh token

**Kind**: global function  

| Param | Type |
| --- | --- |
| refreshToken | <code>string</code> | 

<a name="signOut"></a>

## signOut()
Sign out of Firebase

**Kind**: global function  
<a name="discord"></a>

## discord(id, title, description)
Sends a message to the Discord webhook

**Kind**: global function  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| title | <code>string</code> | 
| description | <code>string</code> | 

<a name="$"></a>

## $(query, parent) ⇒ <code>Element</code>
Shortcut for querySelector

**Kind**: global function  

| Param | Type |
| --- | --- |
| query | <code>string</code> | 
| parent | <code>Element</code> | 

<a name="$$"></a>

## $$(query, parent) ⇒ <code>Array.&lt;Element&gt;</code>
Shortcut for querySelectorAll

**Kind**: global function  

| Param | Type |
| --- | --- |
| query | <code>string</code> | 
| parent | <code>Element</code> | 

<a name="$template"></a>

## $template(id) ⇒ <code>Element</code>
Clones a template element

**Kind**: global function  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 

<a name="makeID"></a>

## makeID() ⇒ <code>string</code>
Gfycat-like human-friendly ID generator

**Kind**: global function  
**Returns**: <code>string</code> - ID  
<a name="post"></a>

## post(path, request) ⇒ <code>json</code>
Sends an HTTP GET request

**Kind**: global function  
**Returns**: <code>json</code> - response  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 
| request | <code>Object</code> | 

<a name="imgbb"></a>

## imgbb(data) ⇒ [<code>urlSet</code>](#urlSet)
Uploads an image to ImgBB.com

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>\*</code> | URL or image file |

<a name="dbPath"></a>

## dbPath(path, legacy) ⇒ <code>string</code>
Expands relative path to Firebase realtime database URL

**Kind**: global function  
**Returns**: <code>string</code> - full path  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Relative path |
| legacy | <code>boolean</code> | Use legacy database |

<a name="dbOnce"></a>

## dbOnce(path) ⇒ <code>Promise</code>
Reads the database once

**Kind**: global function  
**Returns**: <code>Promise</code> - response  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 

<a name="dbLive"></a>

## dbLive(path) ⇒ <code>Promise</code>
Reads the database and updates it live

**Kind**: global function  
**Returns**: <code>Promise</code> - response  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 

<a name="dbWrite"></a>

## dbWrite(path, body, legacy) ⇒ <code>Promise</code>
Writes to the database

**Kind**: global function  
**Returns**: <code>Promise</code> - return  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> |  |
| body | <code>Object</code> |  |
| legacy | <code>boolean</code> | Use legacy database |

<a name="googleapis"></a>

## googleapis(path, request) ⇒ <code>Promise</code>
**Kind**: global function  
**Returns**: <code>Promise</code> - response  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 
| request | <code>Object</code> | 

<a name="initResize"></a>

## initResize()
Initiates the resize bar

**Kind**: global function  
<a name="initTextarea"></a>

## initTextarea($textarea)
Initiates a textarea

**Kind**: global function  

| Param | Type |
| --- | --- |
| $textarea | <code>Element</code> | 

<a name="dispatchInput"></a>

## dispatchInput($textarea)
Programmatically trigger the 'input' event on a textarea

**Kind**: global function  

| Param | Type |
| --- | --- |
| $textarea | <code>Element</code> | 

<a name="remapEnter"></a>

## remapEnter($input)
Assign the enter key to trigger the 'change' event

**Kind**: global function  

| Param | Type |
| --- | --- |
| $input | <code>Element</code> | 

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

<a name="urlSet"></a>

## urlSet : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| imageURL | <code>string</code> | URL of full image |
| thumbURL | <code>string</code> | URL of thumbnail |

