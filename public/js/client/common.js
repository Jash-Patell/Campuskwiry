//! Globals variables
var cropper;// for cropping image
var timer;// for search in timer both side search page and message page 
var selectedUsers = []; //for messaging

//!call pageload to realtime notification and message notification
$(document).ready(() => {
  refreshMessagesBadge();
  refreshNotificationsBadge();
})

//! Home text-area and modelpopup logic
$("#postTextarea ,#replyTextarea").keyup((event) => {
  var textbox = $(event.target);
  var value = textbox.val().trim();

  var isModal = textbox.parents(".modal").length == 1;

  var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

  if (submitButton.length == 0) return alert("No submit button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }

  submitButton.prop("disabled", false);
});

//! Home submit(post) button logic
$("#submitPostButton, #submitReplyButton").click(() => {
  var button = $(event.target);

  var isModal = button.parents(".modal").length == 1;
  var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

  var data = {
    content: textbox.val(),
  };

  if (isModal) {
    var id = button.data().id;
    if (id == null) return alert("Button id is null");
    data.answerTo = id;
  }

  $.post("/questions", data, (postData) => {
    if (postData.answerTo) {
      emitNotification(postData.answerTo.postedBy)
      location.reload();
    } else {
      var html = createPostHtml(postData);
      $(".postsContainer").prepend(html);
      textbox.val("");
      button.prop("disabled", true);
    }
  });
});

//! Model Popup with perticular selected question
$("#replyModal").on("show.bs.modal", (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $("#submitReplyButton").data("id", postId);

  $.get("/questions/" + postId, (results) => {
    outputPosts(results.postData, $("#originalPostContainer"));
  });
});
$("#replyModal").on("hidden.bs.modal", () =>
  $("#originalPostContainer").html("")
);
//popup model...
function outputPosts(results, container) {
  container.html("");

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

//! Delete button 
$("#deletePostModal").on("show.bs.modal", (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $("#deletePostButton").data("id", postId);
});
//delete button ajax request and click handler
$("#deletePostButton").click((event) => {
  var postId = $(event.target).data("id");

  $.ajax({
    url: `/questions/${postId}`,
    type: "DELETE",
    success: (data, status, xhr) => {
      if (xhr.status != 202) {
        alert("could not delete post");
        return;
      }

      location.reload();
    },
  });
});

//! Pin Post button
$("#confirmPinModal").on("show.bs.modal", (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $("#pinPostButton").data("id", postId);
})
//pin button ajax request and click handler
$("#pinPostButton").click((event) => {
  var postId = $(event.target).data("id");
  $.ajax({
      url: `/questions/${postId}`,
      type: "PUT",
      data: { pinned: true },
      success: (data, status, xhr) => {

          if(xhr.status != 204) {
              alert("could not pin post");
              return;
          }
          
          location.reload();
      }
  })
})

//! Unpin Post button
$("#unpinModal").on("show.bs.modal", (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $("#unpinPostButton").data("id", postId);
})
//unpin button ajax request and click handler
$("#unpinPostButton").click((event) => {
  var postId = $(event.target).data("id");
  $.ajax({
      url: `/questions/${postId}`,
      type: "PUT",
      data: { pinned: false },
      success: (data, status, xhr) => {

          if(xhr.status != 204) {
              alert("could not unpin post");
              return;
          }
          
          location.reload();
      }
  })
})

//! Like button 
$(document).on("click", ".likeButton", (event) => {
  var button = $(event.target);
  var postId = getPostIdFromElement(button);

  if (postId === undefined) return;
//like button ajax request and click handler
  $.ajax({
    url: `/questions/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      button.find("span").text(postData.likes.length || "");

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
        emitNotification(postData.postedBy)
      } else {
        button.removeClass("active");
      }
    },
  });
});

//! Dislike button
$(document).on("click", ".dislikeButton", (event) => {
  var button = $(event.target);
  var postId = getPostIdFromElement(button);

  if (postId === undefined) return;
//like button ajax request and click handler
  $.ajax({
    url: `/questions/${postId}/dislike`,
    type: "PUT",
    success: (postData) => {
      button.find("span").text(postData.dislikes.length || "");

      if (postData.dislikes.includes(userLoggedIn._id)) {
        button.addClass("active");
        emitNotification(postData.postedBy)
      } else {
        button.removeClass("active");
      }
    },
  });
});

//! Reasked button 
$(document).on("click", ".retweetButton", (event) => {
  var button = $(event.target);
  var postId = getPostIdFromElement(button);

  if (postId === undefined) return;
//reasked button ajax request and click handler
  $.ajax({
    url: `/questions/${postId}/reasked`,
    type: "POST",
    success: (postData) => {
      button.find("span").text(postData.retweetUsers.length || "");

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
        emitNotification(postData.postedBy)
      } else {
        button.removeClass("active");
      }
    },
  });
});

//! Answered page
$(document).on("click", ".post", (event) => {
  var element = $(event.target);
  var postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is("button")) {
    window.location.href = "/answers/" + postId;
  }
});
//answer page output function
function outputPostsWithReplies(results, container) {
  container.html("");

  if(results.answerTo !== undefined && results.answerTo._id !== undefined) {
      var html = createPostHtml(results.answerTo)
      container.append(html);
  }

  var mainPostHtml = createPostHtml(results.postData, true)
  container.append(mainPostHtml);

  results.replies.forEach(result => {
      var html = createPostHtml(result)
      container.append(html);
  });
}

//! Find the id of perticular post (tree structure)
function getPostIdFromElement(element) {
  var isRoot = element.hasClass("post");
  var rootElement = isRoot == true ? element : element.closest(".post");
  var postId = rootElement.data().id;

  if (postId === undefined) return alert("Post id undefined");

  return postId;
}

//! Profile Photo using cropper.js
$("#filePhoto").change(function(){    
  if(this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = (e) => {
          var image = document.getElementById("imagePreview");
          image.src = e.target.result;

          if(cropper !== undefined) {
              cropper.destroy();
          }
          cropper = new Cropper(image, {
              aspectRatio: 1 / 1,
              background: false
          });
      }
      reader.readAsDataURL(this.files[0]);
  }
  else {
      console.log("nope")
  }
})
//profile upload ajax request and click handler
$("#imageUploadButton").click(() => {
  var canvas = cropper.getCroppedCanvas();

  if(canvas == null) {
      alert("Could not upload image. Make sure it is an image file.");
      return;
  }

  canvas.toBlob((blob) => {
      var formData = new FormData();
      formData.append("croppedImage", blob);

      $.ajax({
        url: "/uploads/profilePicture",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: () => location.reload()
    })
  })
})

//! Cover photo using cropper.js
$("#coverPhoto").change(function(){    
  if(this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = (e) => {
          var image = document.getElementById("coverPreview");
          image.src = e.target.result;

          if(cropper !== undefined) {
              cropper.destroy();
          }

          cropper = new Cropper(image, {
              aspectRatio: 16 / 9,
              background: false
          });

      }
      reader.readAsDataURL(this.files[0]);
  }
})
//cover photo upload ajax request and click handler
$("#coverPhotoButton").click(() => {
  var canvas = cropper.getCroppedCanvas();

  if(canvas == null) {
      alert("Could not upload image. Make sure it is an image file.");
      return;
  }

  canvas.toBlob((blob) => {
      var formData = new FormData();
      formData.append("croppedImage", blob);

      $.ajax({
          url: "/uploads/coverPhoto",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: () => location.reload()
      })
  })
})

//! Follow button
$(document).on("click", ".followButton", (e) => {
  var button = $(e.target);
  var userId = button.data().user;

  $.ajax({
    url: `/users/${userId}/follow`,
    type: "PUT",
    success: (data, status, xhr) => {
      if (xhr.status == 404) {
        alert("user not found");
        return;
      }
      var difference = 1;
      if(data.following && data.following.includes(userId)) {
          button.addClass("following");
          button.text("Following");
          emitNotification(userId);
      }
      else {
          button.removeClass("following");
          button.text("Follow");
          difference = -1;
      }
      
      var followersLabel = $("#followersValue");
      if(followersLabel.length != 0) {
          var followersText = followersLabel.text();
          followersText = parseInt(followersText);
          followersLabel.text(followersText + difference);
      }
    }
  });
});

//! Follow and Following html both side search page and user profile page
function createUserHtml(userData, showFollowButton) {

  var name = userData.firstName + " " + userData.lastName;
  var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  var text = isFollowing ? "Following" : "Follow"
  var buttonClass = isFollowing ? "followButton following" : "followButton"

  var followButton = "";
  if (showFollowButton && userLoggedIn._id != userData._id) {
      followButton = `<div class='followButtonContainer'>
                          <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                      </div>`;
  }

  return `<div class='user'>
              <div class='userImageContainer'>
                  <img src='${userData.profilePic}'>
              </div>
              <div class='userDetailsContainer'>
                  <div class='header'>
                      <a href='/profile/${userData.username}'>${name}</a>
                      <span class='username'>@${userData.username}</span>
                  </div>
              </div>
              ${followButton}
          </div>`;
}
// output both side 
function outputUsers(results, container) {
  container.html("");

  results.forEach(result => {
      var html = createUserHtml(result, true);
      container.append(html);
  });

  if(results.length == 0) {
      container.append("<span class='noResults'>No results found</span>")
  }
}

//! Diynamic html function 
function createPostHtml(postData, largeFont = false) {
  if (postData == null) return alert("post object is null");
  var isRetweet = postData.retweetData !== undefined;
  var retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;

  var postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
    return console.log("User object not populated");
  }

  var displayName = postedBy.firstName + " " + postedBy.lastName;
  var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";
  var dislikeButtonActiveClass = postData.dislikes.includes(userLoggedIn._id)
    ? "active"
    : "";
  var retweetButtonActiveClass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? "active"
    : "";
  var largeFontClass = largeFont ? "largeFont" : "";

  //reasked button
  var retweetText = "";
  if (isRetweet) {
    retweetText = `<span>
                        <i class='fas fa-retweet'></i>
                        Reasked by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>    
                    </span>`;
  }

  //replyy button
  var replyFlag = "";
  if (postData.answerTo && postData.answerTo._id) {
    if (!postData.answerTo._id) {
      return alert("Reply to is not populated");
    } else if (!postData.answerTo.postedBy._id) {
      return alert("Posted by is not populated");
    }

    var answerToUsername = postData.answerTo.postedBy.username;
    replyFlag = `<div class='replyFlag'>
                        Answered to <a href='/profile/${answerToUsername}'>@${answerToUsername}<a>
                    </div>`;
  }

  //delete and pin unpin button
  var buttons = "";
    var pinnedPostText = "";
    if (postData.postedBy._id == userLoggedIn._id) {
        var pinnedClass = "";
        var dataTarget = "#confirmPinModal";
        if (postData.pinned === true) {
            pinnedClass = "active";
            dataTarget = "#unpinModal";
            pinnedPostText = "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
        }
    buttons = ` <button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class='bx bx-pin' ></i></button>
                <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='bx bx-x-circle'></i></button>`;
  }

  return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                     ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='pinnedPostText'>${pinnedPostText}</div>
                        <div class='header'>
                            <a href='/profile/${
                              postedBy.username
                            }' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class="far fa-hand-spock"></i>
                                </button>
                            </div>
                            <div class='postButtonContainer yellow'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='bx bx-analyse'></i>
                                    <span>${
                                      postData.retweetUsers.length || ""
                                    }</span>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='bx bx-like'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='dislikeButton ${dislikeButtonActiveClass}'>
                                    <i class='bx bx-message-alt-error' ></i>
                                    <span>${postData.dislikes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

//! Time stamp logic
function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just now";

    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

//! Message group chat user side logic below
// select user 
$("#userSearchTextbox").keydown((event) => {
  clearTimeout(timer);
  var textbox = $(event.target);
  var value = textbox.val();

  if (value == "" && (event.which == 8 || event.keyCode == 8)) {
      // remove user from selection
      selectedUsers.pop();
        updateSelectedUsersHtml();
        $(".resultsContainer").html("");

        if(selectedUsers.length == 0) {
            $("#createChatButton").prop("disabled", true);
        }

      return;
  }
  // 1 sec timer 
  timer = setTimeout(() => {
      value = textbox.val().trim();

      if(value == "") {
          $(".resultsContainer").html("");
      }
      else {
          searchUsers(value);
      }
  }, 1000)

});
// search and ajax request user for message and group chat
function searchUsers(searchTerm) {
  $.get("/users", { search: searchTerm }, results => {
    outputSelectableUsers(results, $(".resultsContainer"));
})
}
// select user for message and group chat
function outputSelectableUsers(results, container) {
  container.html("");

  results.forEach(result => {
      
      if(result._id == userLoggedIn._id|| selectedUsers.some(u => u._id == result._id)) {
          return;
      }

      var html = createUserHtml(result, false);
      var element = $(html);
        element.click(() => userSelected(result))

        container.append(element);
  });

  if(results.length == 0) {
      container.append("<span class='noResults'>No results found</span>")
  }
}
// fuction used to selecte user in group chat
function userSelected(user) {
  selectedUsers.push(user);
  updateSelectedUsersHtml();
  $("#userSearchTextbox").val("").focus();
  $(".resultsContainer").html("");
  $("#createChatButton").prop("disabled", false);
}
// fuction used to selecte user in group chat
function updateSelectedUsersHtml() {
  var elements = [];

  selectedUsers.forEach(user => {
      var name = user.firstName + " " + user.lastName;
      var userElement = $(`<span class='selectedUser'>${name}</span>`);
      elements.push(userElement);
  })

  $(".selectedUser").remove();
  $("#selectedUsers").prepend(elements);
}
// click handeler for create chat button
$("#createChatButton").click(() => {
  var data = JSON.stringify(selectedUsers);

  $.post("/chats", { users: data }, chat => {

      if(!chat || !chat._id) return alert("Invalid response from server.");

      window.location.href = `/messages/${chat._id}`;
  })
});
// get chat name for inbox page and chat page also
function getChatName(chatData) {
  var chatName = chatData.chatName;

  if(!chatName) {
      var otherChatUsers = getOtherChatUsers(chatData.users);
      var namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
      chatName = namesArray.join(", ")
  }

  return chatName;
}
// get chat other user name for inbox page and chat page also
function getOtherChatUsers(users) {
  if(users.length == 1) return users;

  return users.filter(user => user._id != userLoggedIn._id);
}
// recive message function
function messageReceived(newMessage) {
  if($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
      // Show popup notification
      showMessagePopup(newMessage);
  } 
  else {
      addChatMessageHtml(newMessage);
  }

  refreshMessagesBadge()
  
}
// inbox page html
function createChatHtml(chatData) {
  var chatName = getChatName(chatData);
  var image = getChatImageElements(chatData);
  var latestMessage = getLatestMessage(chatData.latestMessage);

  var activeClass = !chatData.latestMessage || chatData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active";
  
  return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
              ${image}
              <div class='resultsDetailsContainer ellipsis'>
                  <span class='heading ellipsis'>${chatName}</span>
                  <span class='subText ellipsis'>${latestMessage}</span>
              </div>
          </a>`;
}
// Latest message first
function getLatestMessage(latestMessage) {
  if(latestMessage != null) {
      var sender = latestMessage.sender;
      return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
  }

  return "New chat";
}
// group chat user image element
function getChatImageElements(chatData) {
  var otherChatUsers = getOtherChatUsers(chatData.users);

  var groupChatClass = "";
  var chatImage = getUserChatImageElement(otherChatUsers[0]);

  if(otherChatUsers.length > 1) {
      groupChatClass = "groupChatImage";
      chatImage += getUserChatImageElement(otherChatUsers[1]);
  }

  return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}
// single user chat image element 
function getUserChatImageElement(user) {
  if(!user || !user.profilePic) {
      return alert("User passed into function is invalid");
  }

  return `<img src='${user.profilePic}' alt='User's profile pic'>`;
}

//!notification client side

// Call markNotificationsAsOpened function on onclick event
$(document).on("click", ".notification.active", (e) => {
  var container = $(e.target);
  var notificationId = container.data().id;

  var href = container.attr("href");
  e.preventDefault();

  var callback = () => window.location = href;
  markNotificationsAsOpened(notificationId, callback);
})

// Html notification container
function createNotificationHtml(notification) {
  var userFrom = notification.userFrom;
  var text = getNotificationText(notification);
  var href = getNotificationUrl(notification);
  var className = notification.opened ? "" : "active";

  return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
              <div class='resultsImageContainer'>
                  <img src='${userFrom.profilePic}'>
              </div>
              <div class='resultsDetailsContainer ellipsis'>
                  <span class='ellipsis'>${text}</span>
              </div>
          </a>`;
}
// Get Notification text
function getNotificationText(notification) {

  var userFrom = notification.userFrom;

  if(!userFrom.firstName || !userFrom.lastName) {
      return alert("user from data not populated");
  }

  var userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
  
  var text;

  if(notification.notificationType == "reasked") {
      text = `${userFromName} reaskeded one of your posts`;
  }
  else if(notification.notificationType == "postLike") {
      text = `${userFromName} liked one of your posts`;
  }
  else if(notification.notificationType == "postdisLike") {
    text = `${userFromName} report one of your posts`;
  }
  else if(notification.notificationType == "answered") {
      text = `${userFromName} answered to one of your posts`;
  }
  else if(notification.notificationType == "follow") {
      text = `${userFromName} followed you`;
  }

  return `<span class='ellipsis'>${text}</span>`;
}
// Get notifiation url
function getNotificationUrl(notification) { 
  var url = "#";

  if(notification.notificationType == "reasked" || 
      notification.notificationType == "postLike" || 
      notification.notificationType == "postdisLike" || 
      notification.notificationType == "answered") {
          
      url = `/answers/${notification.entityId}`;
  }
  else if(notification.notificationType == "follow") {
      url = `/profile/${notification.entityId}`;
  }

  return url;
}
// markd (redaed) notification open
function markNotificationsAsOpened(notificationId = null, callback = null) {
  if(callback == null) callback = () => location.reload();

  var url = notificationId != null ? `/notifications/${notificationId}/markAsOpened` : `/notifications/markAsOpened`;
  $.ajax({
      url: url,
      type: "PUT",
      success: () => callback()
  })
}
// message badge function
function refreshMessagesBadge() {
  $.get("/chats", { unreadOnly: true }, (data) => {
      
      var numResults = data.length;

      if(numResults > 0) {
          $("#messagesBadge").text(numResults).addClass("active");
      }
      else {
          $("#messagesBadge").text("").removeClass("active");
      }

  })
}
// notification badge function
function refreshNotificationsBadge() {
  $.get("/allnotifications", { unreadOnly: true }, (data) => {
      
      var numResults = data.length;

      if(numResults > 0) {
          $("#notificationBadge").text(numResults).addClass("active");
      }
      else {
          $("#notificationBadge").text("").removeClass("active");
      }

  })
}
// notification popup
function showNotificationPopup(data) {
  var html = createNotificationHtml(data);
  var element = $(html);
  element.hide().prependTo("#notificationList").slideDown("fast");

  setTimeout(() => element.fadeOut(400), 5000);
}
// msg notification popup
function showMessagePopup(data) {

  if(!data.chat.latestMessage._id) {
      data.chat.latestMessage = data;
  }

  var html = createChatHtml(data.chat);
  var element = $(html);
  element.hide().prependTo("#notificationList").slideDown("fast");

  setTimeout(() => element.fadeOut(400), 5000);
}