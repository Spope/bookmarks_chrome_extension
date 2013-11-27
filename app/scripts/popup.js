
var auth = new OAuth2('bookmarks', {
    client_id: 'chrome_321',
    client_secret: 'az97j24ho24cvh24xq671345ef5uop54',
});

auth.authorize(function(){
    console.log('lol');
    auth.getAccessToken();
    auth.updateLocalStorage();
    alert('ok');


    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                // Great success: parse response with JSON
                var parsed = JSON.parse(xhr.responseText);
                var html = '';
                parsed.data.forEach(function(item, index) {
                    html += '<li>' + item.name + '</li>';
                });
                document.querySelector('#music').innerHTML = html;
                return;

            } else {
            // Request failure: something bad happened
            }
        }
    };

    xhr.open('GET', 'http://devserver2.com:1337/api/user/1/load', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'OAuth ' + auth.getAccessToken());

    xhr.send();
});

