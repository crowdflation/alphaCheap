// Regex-pattern to check URLs against.
// TODO: make this an array
var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?walmart\.com\/grocery\/*/;

// A function to use as callback
function doStuffWithDom(domContent) {
  //TODO: send it to the backend for storage
  console.log('I received the following DOM content:\n' + domContent);
}
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo?.status =='complete') {
    if (urlRegex.test(tab.url)) {
      // haven't figured out a better way to do this yet, so we just wait 5 seconds after page is loaded
      setTimeout(()=> {
        // ...if it matches, send a message specifying a callback too
        chrome.tabs.sendMessage(tab.id, {text: 'walmart'}, doStuffWithDom)
      }, 5000);
    }
  }
});
