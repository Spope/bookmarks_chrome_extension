var popUp = {
    auth: new OAuth2('bookmarks', {
        client_id: 'chrome_extension',
        client_secret: 'az97j24ho24cvh24xq671345ef5uop54',
    }),
    server: 'http://bookmarks.spope.fr',
    user: null,
    bookmark: {},

    init: function(){
        this.viewManager.set(1);
        var _this = this;
        //Get Oauth token
        this.auth.authorize(function(){

            var options = {
                url: _this.server+'/api/islogged',
                error: "Can't retrieve your account parameters",
                callback: function(text){
                    _this.user = JSON.parse(text);

                    document.querySelector('#hello').innerHTML = 'Hi '+_this.user.username;
                    _this.refreshCategories();
                }
            };
            _this.xhr(options);

        });

        /////////////////////////////
        ////////KEY BINDING//////////
        /////////////////////////////

        //Bind the previous btn
        var list = document.querySelectorAll('.previous');
        for(var i=0; i<list.length; i++){
            list[i].addEventListener('click', function(e) {
                _this.viewManager.set(_this.viewManager.getCurrentState() -1);
            });
        }

        //logout button
        document.querySelector('#btn-logout').addEventListener('click', function(e){
            _this.auth.clearAccessToken();
            window.close();
        });

        //When hitting 'enter', submit the new bookmark
        document.querySelector('#name').addEventListener('keydown', function(e){
            if(e.keyCode == 13){
                _this.bookmark.name = document.querySelector('#input-name').value;
                _this.addBookmark();
            }
        });

        //submit button
        document.querySelector('#btn-add').addEventListener('click', function(e){
            _this.bookmark.name = document.querySelector('#input-name').value;
            _this.addBookmark();
        });
    },

    refreshCategories: function() {
        var _this = this;

        var options = {
            url: _this.server+'/api/user/'+_this.user.id+'/categories',
            error: "Can't retrieve your categories",
            callback: function(text){
                _this.viewManager.set(2);

                // Great success: parse response with JSON
                var parsed = JSON.parse(text);
                var html = '';
                for(i in parsed) {
                    if(parsed[i].name == '__default'){
                        parsed[i].name = 'Favorite';
                    }
                    html += '<li class="category pointer" data-id="'+parsed[i].id+'">'+parsed[i].name+'</li>';
                };
                document.querySelector('#categories-list').innerHTML = html;

                var list = document.querySelectorAll('.category');

                for(var i=0; i< list.length; i++){
                    list[i].addEventListener('click', _this.clicked);
                }
            }
        }
        _this.xhr(options);
    },

    clicked: function(e) {
        var _this = popUp;
        chrome.tabs.query({'active': true}, function(tabs){
            _this.bookmark.url = tabs[0].url;
            _this.bookmark.category_id = e.target.dataset.id;

            _this.askName();
        });
    },

    askName: function(){
        var _this = this;
        this.viewManager.set(3);
        document.querySelector('#input-name').placeholder = this.bookmark.url.match(/:\/\/(.[^/]+)/)[1].replace('www.', '');
        document.querySelector('#input-name').focus();
    },

    addBookmark: function(){
        var _this = this;
        this.bookmark.bookmark_type_id = 1;

        var params = '';
        for(var key in this.bookmark) {
            params += key+'='+escape(this.bookmark[key])+'&';
        }
        params = params.substr(0, params.length-1);

        var options = {
            method: 'POST',
            url: _this.server+'/api/user/'+_this.user.id+'/bookmark',
            body: params,
            error: "Can't add this bookmark",
            requestHeader: 'application/x-www-form-urlencoded',
            callback: function(text){
                var parsed = JSON.parse(text);

                if(parsed.id) {
                    _this.viewManager.set(4);
                }
            }
        }
        this.xhr(options);
    },

    xhr: function(options){

        var _this = this;

        options.body = options.body || '';
        options.method = options.method || 'GET';
        options.requestHeader = options.requestHeader || 'application/json';
        if(!options.url)throw Error('XHR need a URL');

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(event) {
            if (xhr.readyState == 4) {

                if(xhr.status == 200) {
                    if(options.callback){
                        options.callback(xhr.responseText);
                    }
                    return;
                } else {
                    document.querySelector('#error').innerHTML = options.error ||'Error on xhr';
                }
            }
        };
        xhr.open(options.method, options.url+'?access_token='+_this.auth.getAccessToken(), true);
        xhr.setRequestHeader('Content-Type', options.requestHeader);
        xhr.send(options.body);
    },


    viewManager: {
        states: {
            1: '#loader',
            2: '#categories',
            3: '#name',
            4: '#finished'
        },
        currentState: 1,
        getCurrentState: function(){
            return this.currentState;
        },
        set: function(state){
            for(var i in this.states){
                document.querySelector(this.states[i]).style.display = 'none';
                document.querySelector(this.states[i]).style.opacity = 0;
            }

            document.querySelector(this.states[state]).style.display ='block';

            //Fade in
            var that = this;
            var o = 0;
            var timer = setInterval(function(){
                o += 0.1;
                document.querySelector(that.states[state]).style.opacity = o;
                if(document.querySelector(that.states[state]).style.opacity >= 1){
                    clearInterval(timer);
                    that.currentState = state;
                }
            }, 30);
        }
    }
};

popUp.init();
