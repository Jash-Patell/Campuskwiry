// search timer for each 1 sec
$("#searchBox").keydown((event) => {
    clearTimeout(timer);
    var textbox = $(event.target);
    var value = textbox.val();
    var searchType = textbox.data().search;

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == "") {
            $(".resultsContainer").html("");
        }
        else {
            search(value, searchType);
        }
    }, 1000)

})

// function to check tab for user and post
function search(searchTerm, searchType) {
    var url = searchType == "users" ? "/users" : "/questions"

    $.get(url, { search: searchTerm }, (results) => {        
        if(searchType == "users") {
            outputUsers(results, $(".resultsContainer"));
        }
        else {
            outputPosts(results, $(".resultsContainer"))
        }
    })
}