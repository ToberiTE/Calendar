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

$("#showReg").on('click', function () {
    $(".login-box").hide();
    $(".register-box").fadeIn(500).show();
    $("#emailLoginField").val("");
    $("#passwordLoginField").val("");
});

$("#showLogin").on('click', function () {
    $(".register-box").hide();
    $(".login-box").fadeIn(500).show();
    $("#emailRegisterField").val("");
    $("#passwordRegisterField").val("");
    $("#passwordConfirmField").val("");
});

$("#register").on('click', function () {
    var data = { Email: $("#emailRegisterField").val().trim(), Password: $("#passwordRegisterField").val().trim(), ConfirmPassword: $("#passwordConfirmField").val().trim() };
    $.ajax({
        url: "http://localhost:54593/api/Account/Register",
        type: 'POST',
        data: data
    }).done(function (resp) {
        $(".info").text(resp).css("color", "rgb(0, 179, 0)");
        $("#emailRegisterField").val("");
        $("#passwordRegisterField").val("");
        $("#passwordConfirmField").val("");
    }).fail(function () {
        $(".info").text("Fel! Försök igen.").css("color", "red");
    });
});

$("#login").on('click', function () {
    $.ajax({
        url: "http://localhost:54593/Token",
        type: "POST",
        dataType: "json",
        data: $.param({ username: $("#emailLoginField").val(), password: $("#passwordLoginField").val(), grant_type: 'password' }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        success: function (resp) {
            sessionStorage.setItem('token', resp.access_token);
            var authHeaders = {};
            authHeaders.Authorization = 'Bearer ' + resp.access_token;
            $.ajax({
                url: "http://localhost:54593/api/values",
                type: "GET",
                dataType: 'json',
                headers: authHeaders,
                success: function (response) {
                    $("#emailField").val("");
                    $("#passwordField").val("");
                    $(".info").text(response).css("color", "rgb(0, 179, 0)");
                    setTimeout(function () {
                        window.location.href = "http://localhost:54598/Calendar";
                    }, 1500);
                }
            });
        },
        error: function () {
            $(".info").text("Fel! Försök igen.").css("color", "red");
        }
    });
});

