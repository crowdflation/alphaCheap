// Regex-pattern to check URLs against.
// TODO: make this an array
import vendors from './vendors'


const getLocation = () => {
  return new Promise(function(succ:(any)) {
    if ('geolocation' in navigator) {
      console.log('Trying to get location');
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log('Got location as', position.coords);
        succ(position.coords);
      }, function (err) {
        console.log('Failed to get location', err);
        succ(null);
      });
    } else {
      succ(null);
    }
  });
};

const handleResponse = async (response) => {
  let location:any = await getLocation();

  let { data, vendor } = JSON.parse(response);

  // Send data to website
  // TODO: This will send data to blockchain directly later on
  // FIXME: replace with axios
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
  xmlhttp.open("POST", vendors[vendor].backend);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify({data, location: {longitude: location.longitude, latitude: location.latitude}}));
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo?.status =='complete') {
    for(let key in vendors) {
      const vendor = vendors[key];
      if (vendor.urlRegex.test(tab.url as string)) {
        // haven't figured out a better way to do this yet, so we just wait 5 seconds after page is loaded
        setTimeout(()=> {
          // ...if it matches, send a message specifying a callback too
          chrome.tabs.sendMessage(tab.id as number, {text: key}, handleResponse)
        }, 5000);
      }
    }
  }
});
