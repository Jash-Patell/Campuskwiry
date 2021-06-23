var connected = false;

var socket = io("http://localhost:8080")
socket.emit("setup", userLoggedIn);

socket.on("connected", () => connected = true);
socket.on("message received", (newMessage) => messageReceived(newMessage));

socket.on("notification received", () => {
    $.get("/notifications/latest", (notificationData) => {
        showNotificationPopup(notificationData)
        refreshNotificationsBadge();
    })
})

function emitNotification(userId) {
    if(userId == userLoggedIn._id) return;

    socket.emit("notification received", userId);
}