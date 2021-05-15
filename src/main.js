var modbot = require('./modbot.js');

function wait(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

const content = 'VC'

const pageSize = 25;
var id;

async function main() {
    let bot = modbot({threadUrl: '/viewtopic.php?f=51&t=86578'})
    let pageOfNextPost;
    let currPage = 17;

    const pollUpdate = async () => {
        console.log(new Date().toString())
        try {
            const posts = await bot.getNumberOfPosts()
            pageOfNextPost = Math.ceil((posts + 1) / pageSize)
            console.log('current posts:', posts, 'current page:', currPage, 'page of next post:', pageOfNextPost)
            
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

    await bot.login();
    console.log('Logged in.')
    // id = setInterval(pollUpdate, 600000);
    const posts = await bot.getNumberOfPosts()
    console.log(posts)
}

try {
    main();
} catch(e) {
    clearInterval(id);
}