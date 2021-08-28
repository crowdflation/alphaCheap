// Regex-pattern to check URLs against.
// TODO: make this an array
const vendors = {
  walmart: {
    urlRegex: /^https?:\/\/(?:[^./?#]+\.)?walmart\.com\/grocery\/*/,
    backend: 'https://mflation.herokuapp.com/api/walmart'
  },
  kroger: {
    urlRegex: /^https?:\/\/(?:[^./?#]+\.)?kroger\.com\/search*/,
    backend: 'https://mflation.herokuapp.com/api/kroger'
  },
};


function handleResponse(response) {
  let location = null;
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      location = position.coords;
    });
  }

  let { data, vendor } = JSON.parse(response);

  // Send data to website
  // TODO: This will send data to blockchain directly later on
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
  xmlhttp.open("POST", vendors[vendor].backend);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify({data, location}));
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo?.status =='complete') {
    for(let key in vendors) {
      const vendor = vendors[key];
      if (vendor.urlRegex.test(tab.url)) {
        // haven't figured out a better way to do this yet, so we just wait 5 seconds after page is loaded
        setTimeout(()=> {
          // ...if it matches, send a message specifying a callback too
          chrome.tabs.sendMessage(tab.id, {text: key}, handleResponse)
        }, 5000);
      }
    }
  }
});
