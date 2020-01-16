var pagetopper = require('./pagetopper.js');

let topper = pagetopper({
    frequency: 300,
    currPage: 1
})

topper.init().then(() => {
    topper.test()
})