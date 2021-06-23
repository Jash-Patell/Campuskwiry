$(document).ready(() => {

    if(selectedTab === "followers") {
        loadFollowers();
    }
    else {
        loadFollowing();
    }
});

function loadFollowers() {
    $.get(`/users/${profileUserId}/followers`, results => {
        outputUsers(results.followers, $(".resultsContainer"));
    })
}

function loadFollowing() {
    $.get(`/users/${profileUserId}/following`, results => {
        outputUsers(results.following, $(".resultsContainer"));
    })
}