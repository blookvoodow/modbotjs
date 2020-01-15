var modbot = require('./modbot.js')

var content = `
pagetop content [change this to whatever you want]
`


function pagetopper(options) {
    let threadUrl = process.env.THREAD || options.threadUrl
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
                bot.makePost(content).then(() => {
                    currPage = pageOfNextPost
                })
            }
        })
    }

    function test() {
        bot.getNumberOfPosts().then(posts => {
            console.log(posts)
        })
    }

    function schedule() {
        return setInterval(test, frequency * 1000)
    }

    return {
        init,
        schedule
    }
}

// let topper = pagetopper({
//     frequency: 15,
//     currPage: 1,
//     threadUrl: "viewtopic.php?f=90&t=77684"
// })

// topper.init().then(() => {
//     topper.schedule()
// })

let bot = modbot({})
bot.login().then(() => {
    bot.parseThread({})
})