// Regex-pattern to check URLs against.
// TODO: make this an array
var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?walmart\.com\/grocery\/*/;

// A function to use as callback
function doStuffWithDom(domContent) {
  let location = null;
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      location = position.coords;
    });
  }

  let data = JSON.parse(domContent);

  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
  xmlhttp.open("POST", 'https://mflation.herokuapp.com/api/walmart');
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify({data, location}));
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
