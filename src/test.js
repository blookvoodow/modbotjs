var qs = require('querystring')

let url = '/viewtopic.php?f=83&t=79139'
url = url.slice(url.indexOf('?')+1)

console.log(qs.parse(url))