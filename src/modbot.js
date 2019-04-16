require('dotenv').config()
var requestp = require('request-promise')
var cheerio = require('cheerio')
var querystring = require('querystring')


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
                count = pagination.slice(pattern.index, pattern.index + pattern[0].length - 6)
            }
            return parseInt(count)
        })
    }

    function makePost(content) {
        let url = threadUrl.slice(threadUrl.indexOf('?')+1)
        let {
            f,
            t
        } = querystring.parse(url)

        // get form metadata first
        rp.get('/posting.php', {
            useQuerystring: true,
            qs: {
                mode: 'reply',
                f: f,
                t: t
            }
        }).then(response => {
            let $ = cheerio.load(response.body)
            return {
                // TODO: sanitize input
                message: content,
                postqr: 'Submit',
                attach_sig: true,
                topic_id: t,
                forum_id: f,
                creation_time: Math.floor(new Date() / 1000),
                lastclick: Math.floor(new Date() / 1000) - 1,
                form_token: $('input[name=form_token]').first().attr('value'),
                topic_cur_post_id: $('input[name=topic_cur_post_id]').first().attr('value')
            }
        }).then(form => {
            return rp.post('/posting.php', {
                useQuerystring: true,
                qs: {
                    mode: 'reply',
                    f,
                    t
                },
                form
            })
        })
    }

    return {
        login,
        getUserId,
        getNumberOfPosts,
        makePost
    }
}

let bot = modbot({username: 'Brigand Vvulf', threadUrl: '/viewtopic.php?f=90&t=77684'})

bot.login().then(() => {
    return bot.getUserId('yessiree')
}).then(() => {
    bot.makePost('test')
})