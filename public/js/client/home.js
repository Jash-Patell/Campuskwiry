$(document).ready(() => {
    $.get("/questions", { followingOnly: true }, results => {
        outputPosts(results, $(".postsContainer"));
    })
})
