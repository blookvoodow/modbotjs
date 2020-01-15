var dotenv = require('dotenv')
var requestp = require('request-promise')
var cheerio = require('cheerio')
var querystring = require('querystring')

let config = dotenv.config()
if (config.error) {
    throw result.error
}

function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    })
}


function modbot(options) {
    let {
        threadUrl
    } = options

    let rp = requestp.defaults({
        baseUrl: 'https://forum.mafiascum.net/',
        timeout: 3000,
        resolveWithFullResponse: true,
        jar: true,
        transform: response => cheerio.load(response),
        transform2xxOnly: true
    });

    function login() {
        return rp.post('/ucp.php?mode=login', {
            formData: {
                username: process.env.USERNAME,
                password: process.env.PASSWORD,
                login: 'Login'
            }
        }).catch(e => console.log)
    }

    function getUserId(user) {
        return rp.get('/search.php', {
            useQuerystring: true,
            qs: {
                keywords: '',
                terms: 'all',
                author: user
            }
        }).then($ => {
            let link = $('.postprofile .author a', $('.search.post').first()).attr('href')
            return link.slice(link.lastIndexOf('=')+1)
        })
    }

    function getUserTopics(options) {
        let {
            user,
            forumIds
        } = options

        return rp.get('/search.php', {
            useQuerystring: true,
            qs: {
                keywords: '',
                terms: 'all',
                author: user,
                'fid[]': forumIds,
                sc: 0,
                sf: 'msgonly',
                sr: 'topics',
                sk: 't',
                sd: 'd',
                st: 0,
                ch: 100,
                t: 0,
                submit: 'Search'
            },
            qsStringifyOptions: {indices: false}
        })
    }

    // https://forum.mafiascum.net/viewtopic.php?f=84&t=77685&user_select[]=21774&view=print&ppp=200
    function getPostsByUser(options) {
        let {
            link,
            userId
        } = options
        // determine if the user participated in the game
        return rp.get(`${link}&user_select[]=${userId}&view=print&ppp=200`).then($ => {
            let postCount = $('#page-body .post').length
            let posts = []

            // we assume if they made more than 10 posts, they were a player
            if(postCount > 10) {
                // remove quotes
                $('.post blockquote').remove()
                // convert <br/>s to line breaks \n
                $('.post br').html('\n')
                // get the date and content
                $('#page-body .post').map((i, x) => {
                    let date = $('.date strong', $(x)).text()
                    let content = $('.content', $(x)).text()
                    posts.push([date, content].join())
                })
                return posts
            }
        })
    }

    async function parseThread(options) {
        let {
            threadUrl = "viewtopic.php?f=150&t=80953"
        } = options

        let postNum = await getNumberOfPosts("viewtopic.php?f=150&t=80953")
        let posts = []

        async function crawlPosts(index) {
            let $ = await rp.get(`${threadUrl}&view=print&ppp=200&start=${index}`)
            $('.post br').html('\n')

            return $('.post').map((i,x) => {
                let text = $('.content', $(x)).text()
                let author = $('.author', $(x)).text()
                return `${author}: ${text}`
            }).get()
        }

        for(let i=0; i<postNum; i+=199) {
            posts = posts.concat(await crawlPosts(i))
        }

        console.log(posts)
        return posts;
    }

    function getPostsFromUser(options) {
        let {
            user
        } = options

        return getUserTopics({
            user,
            // forum ids: newbie 11, 50, open 51, 52, micro 83, 84
            forumIds: [11,50,51,52,83,84]
        }).then($ => {
            let links = $('a.topictitle');

            [...links].filter(x => {
                console.log($(x).siblings('a').text())
                return $(x).siblings('a').text() !== user
            }).map(x => $(x).attr('href').get())
            

            console.log(links)
            return links.slice(0, 10)
        }).then(async links => {
            let userId = await getUserId(user);

            return Promise.all(links.map(link => {
                return getPostsByUser({
                    link, userId
                })
            })).then(values => {
                return values
            })
        }).catch(e => {
            console.log(e)
        })
        // for each game thread
        // check if user was a player (from archives?) and get alignment
        // get user posts
        // filter out only relevant game posts
    }

    function getNumberOfPosts(url) {
        url = url || threadUrl
        return rp.get(url).then($ => {
            let count = 0
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
        return rp.get('/posting.php', {
            useQuerystring: true,
            qs: {
                mode: 'reply',
                f: f,
                t: t
            }
        }).then($ => {
            return {
                // TODO: sanitize input
                message: content,
                postqr: 'Submit',
                attach_sig: true,
                topic_id: t,
                forum_id: f,
                creation_time: $('input[name=creation_time]').first().attr('value'),
                lastclick: $('input[name=lastclick]').first().attr('value'),
                form_token: $('input[name=form_token]').first().attr('value'),
                topic_cur_post_id: $('input[name=topic_cur_post_id]').first().attr('value')
            }
        }).then(form => {
            // add an artificial delay to the second call since 
            // we could get a 302 redirect if executed too fast
            return delay(5000).then(() => {
                return rp.post('/posting.php', {
                    useQuerystring: true,
                    qs: {
                        mode: 'reply',
                        f,
                        t
                    },
                    form
                }).then(() => {
                    console.log('made a post')
                }).catch(error => {
                    console.log(error.message)
                })
            })
        })
    }

    return {
        login,
        getUserId,
        getNumberOfPosts,
        getPostsFromUser,
        parseThread,
        makePost
    }
}

module.exports = modbot