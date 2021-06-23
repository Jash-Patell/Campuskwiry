$(document).ready(() => {
    $.get("/spam/getspam", results => {
        console.log(results);
        outspamPosts(results, $(".home-content"));
    })
})

$(document).on('click', '#deleteButton', (results) => { 

  alert("heloo")
  
  // var postId = results.content

  // $.ajax({
  //   url: `/spam/${postId}`,
  //   type: "DELETE",
  //   success: (data, status, xhr) => {
  //     if (xhr.status != 202) {
  //       alert("could not delete post");
  //       return;
  //     }

  //     location.reload();
  //   },
  // });

});

  function outspamPosts(results, container) {
    container.html(`<div class="wrapper-grid">
        </div>
    </div>`);

    results.spamPosts.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function createPostHtml(result) {

    Username = result.postedBy.username
    profilePic = result.postedBy.profilePic
    totalspam = result.dislikes.length
    postcontent = result.content 
    
    return `<div class="wrapper-grid">
    <div class="container"><img class="profile-img" src='${profilePic}'>
        <h1 class="name">${Username}</h1>
        <h1 class="name">Total spamed : ${totalspam} </h1>
        <p class="description"> ${postcontent} </p>
        <button id="deleteButton" class="deletbtn btn btn-danger" type="button"> Delete </button>
    </div>
</div>`;
}
