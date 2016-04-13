$(function() {
  var serverUrl = "http://v9.workbook.net/";
    $.ajax({
        type: "POST",
        url: serverUrl + "api/auth/basic",
        headers: {
            "Authorization": basicAuthHeader("dlj","1234"),
            "Access-Control-Allow-Origin" : ""
        },
    }).done(function (data) {
        //usingBasicAuth = true;
        //loginSuccessful(data.UserId);
    }).fail(function (data) {
        //loginFailed(data);
    });
                

    function basicAuthHeader (username, password) {
        var tok = username + ':' + password;
        var hash = btoa(tok);
        return "Basic " + hash;
    }
    
setInterval(changeUser, 1000);

  function changeUser () {

  }
});