/*!
 * Compressor.js v1.0.7
 * https://fengyuanchen.github.io/compressorjs
 *
 * Copyright 2018-present Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2020-11-28T07:13:17.754Z
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).Compressor=t()}(this,function(){"use strict";function n(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function l(){return(l=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r,a=arguments[t];for(r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e}).apply(this,arguments)}function t(t,e){var r,a=Object.keys(t);return Object.getOwnPropertySymbols&&(r=Object.getOwnPropertySymbols(t),e&&(r=r.filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})),a.push.apply(a,r)),a}function i(a){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?t(Object(n),!0).forEach(function(e){var t,r;t=a,e=n[r=e],r in t?Object.defineProperty(t,r,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[r]=e}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(n)):t(Object(n)).forEach(function(e){Object.defineProperty(a,e,Object.getOwnPropertyDescriptor(n,e))})}return a}var e,r,U=(function(e){var t,n,l,s,c,u,i;"undefined"!=typeof window&&(n=(t=window).HTMLCanvasElement&&t.HTMLCanvasElement.prototype,l=t.Blob&&function(){try{return Boolean(new Blob)}catch(e){return!1}}(),s=l&&t.Uint8Array&&function(){try{return 100===new Blob([new Uint8Array(100)]).size}catch(e){return!1}}(),c=t.BlobBuilder||t.WebKitBlobBuilder||t.MozBlobBuilder||t.MSBlobBuilder,u=/^data:((.*?)(;charset=.*?)?)(;base64)?,/,i=(l||c)&&t.atob&&t.ArrayBuffer&&t.Uint8Array&&function(e){var t,r,a,n,i,o=e.match(u);if(!o)throw new Error("invalid data URI");for(t=o[2]?o[1]:"text/plain"+(o[3]||";charset=US-ASCII"),a=!!o[4],o=e.slice(o[0].length),r=(a?atob:decodeURIComponent)(o),a=new ArrayBuffer(r.length),n=new Uint8Array(a),i=0;i<r.length;i+=1)n[i]=r.charCodeAt(i);return l?new Blob([s?n:a],{type:t}):((o=new c).append(a),o.getBlob(t))},t.HTMLCanvasElement&&!n.toBlob&&(n.mozGetAsFile?n.toBlob=function(e,t,r){var a=this;setTimeout(function(){r&&n.toDataURL&&i?e(i(a.toDataURL(t,r))):e(a.mozGetAsFile("blob",t))})}:n.toDataURL&&i&&(n.msToBlob?n.toBlob=function(e,t,r){var a=this;setTimeout(function(){(t&&"image/png"!==t||r)&&n.toDataURL&&i?e(i(a.toDataURL(t,r))):e(a.msToBlob(t))})}:n.toBlob=function(e,t,r){var a=this;setTimeout(function(){e(i(a.toDataURL(t,r)))})})),e.exports?e.exports=i:t.dataURLtoBlob=i)}(r={path:e,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&r.path)}},r.exports),r.exports),o={strict:!0,checkOrientation:!0,maxWidth:1/0,maxHeight:1/0,minWidth:0,minHeight:0,width:void 0,height:void 0,quality:.8,mimeType:"auto",convertSize:5e6,beforeDraw:null,drew:null,success:null,error:null},s="undefined"!=typeof window&&void 0!==window.document?window:{},c=Array.prototype.slice;var a=/^image\/.+$/;function B(e){return a.test(e)}var d=String.fromCharCode;var u=s.btoa;function h(e,t){for(var r,a=[],n=new Uint8Array(e);0<n.length;)a.push(d.apply(null,(r=n.subarray(0,8192),Array.from?Array.from(r):c.call(r)))),n=n.subarray(8192);return"data:".concat(t,";base64,").concat(u(a.join("")))}function f(e){var t,r,a,n,i,o,l=new DataView(e);try{if(255===l.getUint8(0)&&216===l.getUint8(1))for(var s=l.byteLength,c=2;c+1<s;){if(255===l.getUint8(c)&&225===l.getUint8(c+1)){r=c;break}c+=1}if(r&&(n=r+10,"Exif"===function(e,t,r){var a,n="";for(r+=t,a=t;a<r;a+=1)n+=d(e.getUint8(a));return n}(l,r+4,4)&&(!(o=18761===(i=l.getUint16(n)))&&19789!==i||42!==l.getUint16(n+2,o)||8<=(i=l.getUint32(n+4,o))&&(a=n+i))),a)for(var u,h=l.getUint16(a,o),f=0;f<h;f+=1)if(u=a+12*f+2,274===l.getUint16(u,o)){u+=8,t=l.getUint16(u,o),l.setUint16(u,1,o);break}}catch(e){t=1}return t}var m=/\.\d*(?:0|9){12}\d*$/;function O(e,t){t=1<arguments.length&&void 0!==t?t:1e11;return m.test(e)?Math.round(e*t)/t:e}var b=s.ArrayBuffer,p=s.FileReader,g=s.URL||s.webkitURL,y=/\.\w+$/,w=s.Compressor;return function(){function r(e,t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,r),this.file=e,this.image=new Image,this.options=i(i({},o),t),this.aborted=!1,this.result=null,this.init()}var e,t,a;return e=r,a=[{key:"noConflict",value:function(){return window.Compressor=w,r}},{key:"setDefaults",value:function(e){l(o,e)}}],(t=[{key:"init",value:function(){var a,e,n,i=this,o=this.file,t=this.options;e=o,"undefined"!=typeof Blob&&(e instanceof Blob||"[object Blob]"===Object.prototype.toString.call(e))?B(a=o.type)?g&&p?(b||(t.checkOrientation=!1),g&&!t.checkOrientation?this.load({url:g.createObjectURL(o)}):(e=new p,n=t.checkOrientation&&"image/jpeg"===a,(this.reader=e).onload=function(e){var t=e.target.result,r={};n?1<(e=f(t))||!g?(r.url=h(t,a),1<e&&l(r,function(e){var t=0,r=1,a=1;switch(e){case 2:r=-1;break;case 3:t=-180;break;case 4:a=-1;break;case 5:t=90,a=-1;break;case 6:t=90;break;case 7:t=90,r=-1;break;case 8:t=-90}return{rotate:t,scaleX:r,scaleY:a}}(e))):r.url=g.createObjectURL(o):r.url=t,i.load(r)},e.onabort=function(){i.fail(new Error("Aborted to read the image with FileReader."))},e.onerror=function(){i.fail(new Error("Failed to read the image with FileReader."))},e.onloadend=function(){i.reader=null},n?e.readAsArrayBuffer(o):e.readAsDataURL(o))):this.fail(new Error("The current browser does not support image compression.")):this.fail(new Error("The first argument must be an image File or Blob object.")):this.fail(new Error("The first argument must be a File or Blob object."))}},{key:"load",value:function(e){var t=this,r=this.file,a=this.image;a.onload=function(){t.draw(i(i({},e),{},{naturalWidth:a.naturalWidth,naturalHeight:a.naturalHeight}))},a.onabort=function(){t.fail(new Error("Aborted to load the image."))},a.onerror=function(){t.fail(new Error("Failed to load the image."))},s.navigator&&/(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(s.navigator.userAgent)&&(a.crossOrigin="anonymous"),a.alt=r.name,a.src=e.url}},{key:"draw",value:function(e){var t=this,r=e.naturalWidth,a=e.naturalHeight,n=e.rotate,i=void 0===n?0:n,o=e.scaleX,l=void 0===o?1:o,s=e.scaleY,c=void 0===s?1:s,u=this.file,h=this.image,f=this.options,d=document.createElement("canvas"),m=d.getContext("2d"),b=r/a,p=Math.abs(i)%180==90,g=Math.max(f.maxWidth,0)||1/0,y=Math.max(f.maxHeight,0)||1/0,w=Math.max(f.minWidth,0)||0,n=Math.max(f.minHeight,0)||0,o=Math.max(f.width,0)||r,e=Math.max(f.height,0)||a;p&&(g=(s=[y,g])[0],y=s[1],w=(s=[n,w])[0],n=s[1],o=(s=[e,o])[0],e=s[1]),g<1/0&&y<1/0?g<y*b?y=g/b:g=y*b:g<1/0?y=g/b:y<1/0&&(g=y*b),0<w&&0<n?w<n*b?n=w/b:w=n*b:0<w?n=w/b:0<n&&(w=n*b),o<e*b?e=o/b:o=e*b;w=-(o=Math.floor(O(Math.min(Math.max(o,w),g))))/2,g=-(e=Math.floor(O(Math.min(Math.max(e,n),y))))/2,n=o,y=e;p&&(o=(v=[e,o])[0],e=v[1]),d.width=o,d.height=e,B(f.mimeType)||(f.mimeType=u.type);var v="transparent";u.size>f.convertSize&&"image/png"===f.mimeType&&(v="#fff",f.mimeType="image/jpeg"),m.fillStyle=v,m.fillRect(0,0,o,e),f.beforeDraw&&f.beforeDraw.call(this,m,d),this.aborted||(m.save(),m.translate(o/2,e/2),m.rotate(i*Math.PI/180),m.scale(l,c),m.drawImage(h,w,g,n,y),m.restore(),f.drew&&f.drew.call(this,m,d),this.aborted||(m=function(e){t.aborted||t.done({naturalWidth:r,naturalHeight:a,result:e})},d.toBlob?d.toBlob(m,f.mimeType,f.quality):m(U(d.toDataURL(f.mimeType,f.quality)))))}},{key:"done",value:function(e){var t=e.naturalWidth,r=e.naturalHeight,a=e.result,n=this.file,i=this.image,e=this.options;g&&!e.checkOrientation&&g.revokeObjectURL(i.src),!a||e.strict&&a.size>n.size&&e.mimeType===n.type&&!(e.width>t||e.height>r||e.minWidth>t||e.minHeight>r)?a=n:(r=new Date,a.lastModified=r.getTime(),a.lastModifiedDate=r,a.name=n.name,a.name&&a.type!==n.type&&(a.name=a.name.replace(y,("jpeg"===(n=B(n=a.type)?n.substr(6):"")&&(n="jpg"),".".concat(n))))),this.result=a,e.success&&e.success.call(this,a)}},{key:"fail",value:function(e){var t=this.options;if(!t.error)throw e;t.error.call(this,e)}},{key:"abort",value:function(){this.aborted||(this.aborted=!0,this.reader?this.reader.abort():this.image.complete?this.fail(new Error("The compression process has been aborted.")):(this.image.onload=null,this.image.onabort()))}}])&&n(e.prototype,t),a&&n(e,a),r}()});