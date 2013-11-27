'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});
    //'request_url': 'http://devserver2.com:1337/dialog/authorize?response_type=code',
    //'authorize_url': 'http://devserver2.com:1337/dialog/authorize/decision',
    //'access_url': 'http://devserver2.com:1337/oauth/token',


