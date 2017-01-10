/**
 * Created by fisch on 10.01.2017.
 */
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        loginToFacebook();
    } else if (response.status === 'not_authorized') {
        logout();
    } else {
        logout();
    }
}

function subscribeToEvents() {
    FB.Event.subscribe('auth.logout', logout_event);
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '1266168580143865',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.5' // use graph api version 2.5
    });

    // Now that we've initialized the JavaScript SDK, we call
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    if(localStorage.getItem("id")){
        checkLoginState();
    }else{
        performLogoutActions();
    }

};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function loginToFacebook() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me',{ fields: 'id, name, email' }, function(response) {
        console.log('Successful login for: ' + response.name + " " + response.email + " " + response.id);
        console.log('Successful login for: ' + response.name + " "+response.email+" "+response.id);
        httpRequestAsync("GET", "https://lmttfy-matyapav.rhcloud.com/api/users", null, function (responseText) {
            var userIdByEmail = null;
            var alreadyExists = false;
            if(responseText){
                var users = JSON.parse(responseText);
                alreadyExists = checkIfUserAlreadyExists(users, response.email);
            }
            if(!alreadyExists){
                var data = "username="+response.name+"&email="+response.email;
                httpRequestAsync("POST", "https://lmttfy-matyapav.rhcloud.com/api/users", data, function (responseText) {
                    console.log(JSON.parse(responseText).message);
                    userIdByEmail = JSON.parse(responseText).id;
                    saveUserIdInLocalStorage(userIdByEmail);
                    console.log(localStorage.getItem("id"));
                    performLoginActions();
                    document.getElementById('status').innerHTML =
                        'Logged as <a id="myBtn" onclick="showUserInfo()"> ' + response.name + '</a>!';
                });
            }else{
                userIdByEmail = users[id]._id;
                saveUserIdInLocalStorage(userIdByEmail);
                console.log(localStorage.getItem("id"));
                performLoginActions();
                document.getElementById('status').innerHTML =
                    'Logged as <a id="myBtn" onclick="showUserInfo()"> ' + response.name + '</a>!';
            }
        });


    });
}

function fblogin() {
    FB.login(function (response) {
        if (response.authResponse) {
            checkLoginState();
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, { scope: ['email', 'user_friends'] });
}

function logout(){
    if(confirm("Do you really want to logout?")){
        localStorage.removeItem("id");
        performLogoutActions();
    }
}


function checkIfUserAlreadyExists(users, email){
    for (id in users){
        if(users[id].email == email){
            return true;
        };
    }
    return false;
}

function saveUserIdInLocalStorage(user_id){
    // Check browser support
    if (typeof(Storage) !== "undefined") {
        // Store
        localStorage.setItem("id", user_id);

    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    }
}


function performLoginActions() {
    document.getElementById('login_btn').style = "display: none";
    document.getElementById('logout_btn').style = "display: block";
}

function performLogoutActions(){
    document.getElementById('status').innerHTML = 'Log yourself into application';
    document.getElementById('login_btn').style = "display: block";
    document.getElementById('logout_btn').style = "display: none";
}

