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

// download music file
chrome.runtime.onMessage.addListener(function(msg) {
    // {"url": scope.song.url, "file": filename}
    var url = msg.url,
        filename = msg.filename;
    console.log('runtime.onMSG.addListener:', msg);
    if (null !== url && null !== filename) {
        chrome.downloads.download({'url': url, 'filename': filename});
    }
});
