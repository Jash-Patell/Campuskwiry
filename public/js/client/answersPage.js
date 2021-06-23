$(document).ready(() => {
    $.get(`/questions/${postId}`, results => {
        outputPostsWithReplies(results, $(".postsContainer"));
    })
})