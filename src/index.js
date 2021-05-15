var modbot = require('./modbot.js');

function wait(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

const content = 'VC'

const pageSize = 25;
var id;

async function main() {
    let bot = modbot({threadUrl: '/viewtopic.php?f=51&t=86578'})
    await bot.login();
    console.log('Logged in.')
    let pageOfNextPost;
    const posts = await bot.getNumberOfPosts()
    let currPage = Math.ceil(posts/25);
    console.log('current page set to', currPage)

    const pollUpdate = async () => {
        try {
            const posts = await bot.getNumberOfPosts()
            pageOfNextPost = Math.ceil((posts + 1) / pageSize)
            console.log('total posts:', posts, 'current page:', currPage, 'page of next post:', pageOfNextPost)
            
            if (pageOfNextPost > currPage) {
                console.log('making a post...')
                try {
                    await wait(3000); // wait 3 seconds between requests
                    await bot.makePost(content);
                } catch(e) {
                    console.error('error making a post')
                }
                console.log('successfully made a post on page', pageOfNextPost)
                currPage = pageOfNextPost
            }
        } catch(e) {
            console.error('failed to get posts');
        }
    }

    id = setInterval(pollUpdate, 600000);
}

module.exports = main;