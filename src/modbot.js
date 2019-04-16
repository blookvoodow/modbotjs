require('dotenv').config()
var requestp = require('request-promise')
var cheerio = require('cheerio')


function modbot(options) {
    let {
        username,
        threadUrl
    } = options

    let rp = requestp.defaults({
        baseUrl: 'https://forum.mafiascum.net/',
        timeout: 3000,
        resolveWithFullResponse: true,
        jar: true
    });

    function login() {
        return rp.post('/ucp.php?mode=login', {
            formData: {
                username: username,
                password: process.env.PASSWORD,
                login: 'Login'
            }
        })
    }

    function getUserId(user) {
        return rp.get('/search.php', {
            useQuerystring: true,
            qs: {
                keywords: '',
                terms: 'all',
                author: user
            }
        }).then(response => {
            let $ = cheerio.load(response.body)
            let link = $('.postprofile .author a', $('.search.post').first()).attr('href')
            return link.slice(link.lastIndexOf('=')+1)
        })
    }

    function getNumberOfPosts() {
        return rp.get(threadUrl).then(response => {
            let count = 0
            let $ = cheerio.load(response.body)
            let pagination = $('.pagination').first().text()
            let pattern = pagination.match('[0-9]+ posts')
            if(pattern) {
                count = pagination.slice(pattern.index, pattern.index+pattern[0].length-6)
            }
            return parseInt(count)
        })
    }

    return {
        login,
        getUserId,
        getNumberOfPosts
    }
}

let bot = modbot({username: 'yessiree', threadUrl: '/viewtopic.php?f=83&t=79139'})

bot.login().then(() => {
    bot.getNumberOfPosts().then(userId => {
        console.log(userId)
    })
})