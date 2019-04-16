var modbot = require('./modbot.js')

var content = `
pagetop content
`


function pagetopper(options) {
    let threadUrl = process.env.THREAD
    if (threadUrl.indexOf('https://forum.mafiascum.net') >= 0) {
        threadUrl = threadUrl.slice('https://forum.mafiascum.net'.length)
    }

    let {
        frequency, // seconds
        currPage = 1,
        pageSize = 25
    } = options
    let bot = modbot({threadUrl: threadUrl})

    function init() {
        return bot.login()
    }

    function pagetop() {
        console.log('checking posts')
        bot.getNumberOfPosts().then(posts => {
            pageOfNextPost =  Math.ceil((posts + 1) / pageSize)
            
            if (pageOfNextPost > currPage) {
                console.log('making a post...')
                bot.makePost(content)
                currPage = pageOfNextPost
            }
        })
    }

    function schedule() {
        return setInterval(pagetop, frequency * 1000)
    }

    return {
        init,
        schedule
    }
}

let topper = pagetopper({
    frequency: 10,
    currPage: 1
})

topper.init().then(() => {
    topper.schedule()
})