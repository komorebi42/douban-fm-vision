/**
 * @ngdoc function
 * @name Chrome extension background page
 * @description
 * # background page
 * background page of Chrome extension
 */
'use strict';

chrome.browserAction.onClicked.addListener(function(tab) {
    var manager_url = chrome.extension.getURL('../index.html');
    new CreateTab(manager_url);
});

function CreateTab(url) {
    chrome.windows.getAll({
        'populate': true
    }, function(windows) {
        var existing_tab = null;
        for (var i in windows) {
            var tabs = windows[i].tabs;
            for (var j in tabs) {
                var tab = tabs[j];
                if (tab.url == url) {
                    existing_tab = tab;
                    break;
                }
            }
        }
        if (existing_tab) {
            chrome.tabs.update(existing_tab.id, {
                'selected': true
            });
        } else {
            chrome.tabs.create({
                'url': url,
                'selected': true
            });
        }
    });
}

// chrome.cookies.onChanged.addListener(function(info) {
//     console.log("onChanged" + JSON.stringify(info));
// });


// function checkCookie() {
// 	var fmCookie = {
// 		'signed': false,
// 		'userId': '',
// 		'ck': '',
// 		'bid': ''
// 	};

//     chrome.cookies.get({
//         url: 'http://douban.com',
//         name: 'dbcl2'
//     }, function(result) {
//         if (result) {
//             fmCookie.userId = (result.value.split(':')[0]).slice(1);
//             if (fmCookie.userId) {
//                 chrome.cookies.set({
//                     url: 'http://douban.fm',
//                     name: 'dbcl2',
//                     value: result.value
//                 });
//                 fmCookie.signed = true;
//                 window.console.log('Douban loged:', result.value);
//             } else {
//                 fmCookie.signed = false;
//             }
//         } else {
//             fmCookie.signed = false;
//         }
//     });

//     chrome.cookies.get({
//         url: 'http://douban.com',
//         name: 'ck'
//     }, function(result) {
//         if (result) {
//             chrome.cookies.set({
//                 url: 'http://douban.fm',
//                 name: 'ck',
//                 value: result.value
//             });
//             fmCookie.ck = result.value.split('"')[1];
//         }
//     });

//     chrome.cookies.get({
//         url: 'http://douban.com',
//         name: 'bid'
//     }, function(result) {
//         if (result) {
//             fmCookie.bid = result.value.split('"')[1];
//             if (!fmCookie.bid) {
//                 window.console.log('bid is NOT FOUND:', result);
//             }
//             chrome.cookies.set({
//                 url: 'http://douban.fm',
//                 name: 'bid',
//                 value: result.value
//             });
//         }
//     });

//     return fmCookie;
// }

// // listen message from the page
// chrome.runtime.onConnect.addListener(function(port) {
// 	console.assert(port.name === 'FMinNewVision');
// 	port.onMessage.addListener(function(msg) {
// 		switch (msg.title) {
// 			case 'cookie':
// 				var fm = checkCookie();
// 				port.postMessage({response: 'cookie', value: fm});
// 		}
// 	});
// });

// chrome.browserAction.onClicked.addListener(function(tab) {
// 	chrome.tabs.create({
// 		url: chrome.extension.getURL('../index.html')});
// });
// 
// chrome.browserAction.onClicked.addListener(function(tab) {
// 	chrome.windows.create({
// 		url: chrome.extension.getURL('../index.html'),
// 		left: 10,
// 		top: 10,
// 		width: 1280,
// 		height: 800,
// 		type: 'normal',  // normal, popup, 
// 		focused: true,
// 		// state: 'fullscreen'
// 	}, function(window) {
// 		window.console.log('fullscreen window created', window);
// 	});
// });

// chrome.browserAction.setPopup({popup: '../index.html'});  // popup only exist when clicked

// chrome.app.runtime.onLaunched.addListener(function(launchData) {  // for app
// 	chrome.app.window.create('../index.html', {
// 		id: "FMinNewVision",
// 		bounds: {
// 			width: 1280,
// 			height: 800
// 		},
// 		minWidth: 840,
// 		minHeight: 525,
// 		frame: 'none'
// 	});

// 	// var options = {
// 	// 	windowId: 1,
// 	// 	url: '../index.html',
// 	// 	active: true,
// 	// }
// 	// chrome.tabs.create(options, function(tab) {
// 	// });
// });
