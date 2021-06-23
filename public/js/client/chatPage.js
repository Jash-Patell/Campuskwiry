var typing = false;
var lastTypingTime;

// ajax call for recevice chat name
$(document).ready(() => {

    socket.emit("join room", chatId);
    socket.on("typing", () => $(".typingDots").show());
    socket.on("stop typing", () => $(".typingDots").hide());

    $.get(`/chats/${chatId}`, (data) => $("#chatName").text(getChatName(data)))
    // ajax call for loading messages
    $.get(`/chats/${chatId}/messages`, (data) => {
        var messages = [];
        var lastSenderId = "";

        data.forEach((message, index) => {
            var html = createMessageHtml(message, data[index + 1], lastSenderId);
            messages.push(html);

            lastSenderId = message.sender._id;
        })

        var messagesHtml = messages.join("");
        addMessagesHtmlToPage(messagesHtml);
        scrollToBottom(false);
        markAllMessagesAsRead();

        $(".loadingSpinnerContainer").remove();
        $(".chatContainer").css("visibility", "visible");
    })
})

// ajax call for update chat name 
$("#chatNameButton").click(() => {
    var name = $("#chatNameTextbox").val().trim();
    
    $.ajax({
        url: "/chats/" + chatId,
        type: "PUT",
        data: { chatName: name },
        success: (data, status, xhr) => {
            if(xhr.status != 204) {
                alert("could not update");
            }
            else {
                location.reload();
            }
        }
    })
})


$(".sendMessageButton").click(() => {
    messageSubmitted();
})

$(".inputTextbox").keydown((event) => {

    updateTyping();

    if(event.which === 13 && !event.shiftKey) {
        messageSubmitted();
        return false;
    }
})


function updateTyping() {
    if(!connected) return;

    if(!typing) {
        typing = true;
        socket.emit("typing", chatId);
    }

    lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;

        if(timeDiff >= timerLength && typing) {
            socket.emit("stop typing", chatId);
            typing = false;
        }
    }, timerLength);
}


// message submit button
function messageSubmitted() {
    var content = $(".inputTextbox").val().trim();

    if(content != "") {
        sendMessage(content);
        $(".inputTextbox").val("");
    }
}

function sendMessage(content) {
    $.post("/sendmessages", { content: content, chatId: chatId }, (data, status, xhr) => {
        if(xhr.status != 201) {
            alert("Could not send message");
            $(".inputTextbox").val(content);
            return;
        }
        addChatMessageHtml(data);

        if(connected) {
            socket.emit("new message", data);
        }

    })
}

function addMessagesHtmlToPage(html) {
    $(".chatMessages").append(html);
}

function addChatMessageHtml(message) {
    if(!message || !message._id) {
        alert("Message is not valid");
        return;
    }

    var messageDiv = createMessageHtml(message, null, "");

    addMessagesHtmlToPage(messageDiv);
    scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {

    var sender = message.sender;
    var senderName = sender.firstName + " " + sender.lastName;

    var currentSenderId = sender._id;
    var nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

    var isFirst = lastSenderId != currentSenderId;
    var isLast = nextSenderId != currentSenderId;

    var isMine = message.sender._id == userLoggedIn._id;
    var liClassName = isMine ? "mine" : "theirs";

    var nameElement = "";
    if(isFirst) {
        liClassName += " first";

        if(!isMine) {
            nameElement = `<span class='senderName'>${senderName}</span>`;
        }
    }

    var profileImage = "";
    if(isLast) {
        liClassName += " last";
        profileImage = `<img src='${sender.profilePic}'>`;
    }

    var imageContainer = "";
    if(!isMine) {
        imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`;
    }

    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated) {
    var container = $(".chatMessages");
    var scrollHeight = container[0].scrollHeight;

    if(animated) {
        container.animate({ scrollTop: scrollHeight }, "slow");
    }
    else {
        container.scrollTop(scrollHeight);
    }
}

function markAllMessagesAsRead() {
    $.ajax({
        url: `/chats/${chatId}/messages/markAsRead`,
        type: "PUT",
        success: () => refreshMessagesBadge()
    })
}