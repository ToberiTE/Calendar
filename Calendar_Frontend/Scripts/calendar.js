var loader = $('.spinner-overlay');
var timer;
$(document).ajaxStart(function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
        loader.fadeIn();
    }, 300);
})
    .ajaxStop(function () {
        clearTimeout(timer);
        loader.fadeOut();
    })
    .ajaxError(function () {
        clearTimeout(timer);
        loader.fadeOut();
    });

$(function () {
    $.ajax({
        url: "http://localhost:54593/Calendar/Events",
        type: "POST",
        dataType: 'json',
        headers: { "Authorization": "Bearer " + sessionStorage.getItem('token') }
    }).done(function () {
        renderCalendar();
    }).fail(function () {
        alert("Sidan kräver inloggning.");
        setTimeout(function () {
            window.location.href = "/login";
        }, 1000);
    });
});

function renderCalendar() {
    $("#logOut").show();

    var dp = new DayPilot.Calendar("dp");
    dp.viewType = "Week";
    dp.eventDeleteHandling = "Enabled";
    dp.allowEventOverlap = false;
    dp.heightSpec = "Parent100Pct";
    dp.locale = "sv-se";
    dp.theme = "calendar_transparent";
    dp.dayBeginsHour = 8;
    dp.dayEndsHour = 17;
    dp.init();

    var nav = new DayPilot.Navigator("nav");
    nav.showMonths = 1;
    nav.skipMonths = 1;
    nav.selectMode = "week";
    nav.init();

    $.ajax({
        url: "http://localhost:54593/Calendar/Events",
        type: "GET",
        dataType: 'json',
        data: {
            start: dp.visibleStart().toString(),
            end: dp.visibleEnd().toString()
        },
        headers: { "Authorization": "Bearer " + sessionStorage.getItem('token') },
        success: function (data) {
            dp.events.list = data;
            dp.update();
        }
    });

    nav.onTimeRangeSelected = function (args) {
        dp.startDate = args.day;
        dp.update();
    };

    dp.onEventDelete = function (args) {
        if (!confirm("Vill du ta bort bokningen?")) {
            args.preventDefault();
        }
    };

    dp.onEventDeleted = function (args) {
        $.post("http://localhost:54593/Calendar/Delete/" + args.e.id(), function () {
            dp.events.remove(args.e.id);
            dp.message("Bokning raderad!");
        });
    };

    dp.onEventMoved = function (args) {
        $.post("http://localhost:54593/Calendar/Move",
            {
                id: args.e.id(),
                newStart: args.newStart.toString(),
                newEnd: args.newEnd.toString()
            },
            function () {
                dp.message("Bokning flyttad!");
            });
    };

    dp.onEventResized = function (args) {
        $.post("http://localhost:54593/Calendar/Resize",
            {
                id: args.e.id(),
                newStart: args.newStart.toString(),
                newEnd: args.newEnd.toString()
            },
            function () {
                dp.message("Bokning ändrad!");
            });
    };

    dp.onTimeRangeSelected = function (args) {
        var name = prompt("Ny bokning:", "");
        dp.clearSelection();
        if (!name) return;

        $.post("http://localhost:54593/Calendar/Create",
            {
                start: args.start.toString(),
                end: args.end.toString(),
                name: name
            },
            function (data) {
                var e = new DayPilot.Event({
                    start: args.start,
                    end: args.end,
                    id: data.id,
                    resource: args.resource,
                    text: name
                });
                dp.events.add(e);
                dp.message("Bokning skapad!");
            });
    };
    dp.events.list = [
        {
            start: "00:00",
            end: "12:00",
            text: "Event"
        }
    ];
    dp.bubble = new DayPilot.Bubble({
        onLoad: function (args) {
            var ev = args.source;
            args.async = true;

            setTimeout(function () {
                args.html = "<b>" + ev.text() + "<br>" + "(" + ev.start().toString("HH:mm") + " - " + ev.end().toString("HH:mm") + ")";
                args.loaded();
            }, 300);
        }
    });
}

$(function () {
    $("#logOut").on('click', function () {
        sessionStorage.removeItem('token');
        setTimeout(function () {
            window.location.href = "http://localhost:54598/login";
        }, 1500);
    });
});
