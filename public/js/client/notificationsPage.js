$(document).ready(() => {
    $.get("/allnotifications", (data) => {
        outputNotificationList(data, $(".resultsContainer"))
    })
});

// button for read all notification
$("#markNotificationsAsRead").click(() => markNotificationsAsOpened());
function outputNotificationList(notifications, container) {
    notifications.forEach(notification => {
        var html = createNotificationHtml(notification);
        container.append(html);
    })

    if(notifications.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>");
    }
}

function outputNotificationList(notifications, container) {
    notifications.forEach(notification => {
        var html = createNotificationHtml(notification);
        container.append(html);
    })

    if(notifications.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>");
    }
}