import vendors from './vendors';
import _ from 'lodash';

const NodeRSA = require('node-rsa');

let key:any = null;
let publicKey:any = null;
let publicKeySigned:any = null;
let walletAddress = null;
let walletPublicKey = null;


const readKey = (key:string):Promise<any> => {
  return new Promise((succ) => {
    chrome.storage.sync.get([key], function(result) {
      succ(result?.[key]);
    });
  });
};

const setKey = (key:string, val:any):Promise<any> => {
  return new Promise((succ) => {
    chrome.storage.sync.set({[key]: val}, function () {
      succ()
    });
  });
};


const loadKeys = async () => {
  let keyString = await readKey('keyString');
  if (keyString) {
    key = new NodeRSA(keyString);
    publicKey = key.exportKey('components-public');
    publicKeySigned = await readKey('publicKeySigned');
    walletAddress = await readKey('walletAddress');
  } else {
    key = new NodeRSA({b: 512});
    publicKey = key.exportKey('components-public');
    await setKey('keyString', key.exportKey());
  }
  return;
};

const keysLoaded = loadKeys();


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

function postData(url: string, stringifiedWithSignature: string) {
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
  xmlhttp.open("POST", url);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(stringifiedWithSignature);
}

const handleResponse = async (response) => {
  let location:any = await getLocation();

  let { data, vendor, errors, document, products } = JSON.parse(response);

  const serverUrl = 'https://crowdflation.herokuapp.com';
  //const serverUrl = 'http://localhost:3000';

  // TODO: send  html that has failed to parse to server for analysis
  if(!data.length) {
    console.error('Failed to parse html');
    // Check if there is an email
    if(document.search(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/) !== -1){
      console.log("There is an email !");
      // Remove it...
      document = document.replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,"anynymiszed@email.com");
    }

    //TODO: Anonymise - remove any other potential PI
    const dataToSend = JSON.stringify({vendor, document, errors, products});
    postData(serverUrl + '/api/errors', dataToSend);
    return;
  }

  const payload = {data, location: {longitude: location.longitude, latitude: location.latitude}, date: new Date(), walletAddress, walletPublicKey, publicKey, publicKeySigned};

  const stringified = JSON.stringify(payload);

  // Sign data with users private key
  const signature = key.sign(stringified);

  const signed = {payload, signature: JSON.stringify(signature)};

  const stringifiedWithSignature = JSON.stringify(signed);


  // Send data to website
  // TODO: This will send data to blockchain directly later on
  // FIXME: replace XMLHttpRequest with axios
  postData(serverUrl +'/api/vendors/' + vendor, stringifiedWithSignature);

  if(errors && errors.length) {
    const dataWithErrors = JSON.stringify({ errors, details: {vendor, version: chrome.runtime.getManifest().version, walletAddress, publicKey, publicKeySigned, location: {longitude: location.longitude, latitude: location.latitude}}});
    postData(serverUrl + '/api/errors', dataWithErrors);
  }
};


const handleResponsePublicKey = async (response) => {
  let parsed = response;
  publicKeySigned = parsed?.publicKeySigned;
  walletAddress = parsed?.walletAddress;
  walletPublicKey = parsed?.walletPublicKey;
  if(publicKeySigned && !_.isEmpty(publicKeySigned)) {
    await setKey('publicKeySigned', publicKeySigned);
    await setKey('walletAddress', walletAddress);
  } else {
    // FIXME: figure out why response is undefined
    publicKeySigned = {};
  }
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo?.status =='complete') {
    for(let key in vendors) {
      const vendor = vendors[key];
      if (vendor.urlRegex.test(tab.url as string)) {
        // haven't figured out a better way to do this yet, so we just wait 5 seconds after page is loaded
        setTimeout(async ()=> {
          await keysLoaded;
          // ...if it matches, send a message specifying a callback too

          if(!publicKeySigned) {
            chrome.tabs.sendMessage(tab.id as number, {publicKey}, handleResponsePublicKey)

            const listener = function(request, sender, sendResponse) {
              handleResponsePublicKey(request);
              sendResponse({});
              chrome.runtime.onMessage.removeListener(listener);
            };

            chrome.runtime.onMessage.addListener(listener);

            const cancel = setInterval(()=> {
              if(publicKeySigned) {
                if(_.isEmpty(publicKeySigned, true)) {
                  publicKeySigned = null;
                }
                clearInterval(cancel);
                chrome.tabs.sendMessage(tab.id as number, {text: key}, handleResponse);
              }
            }, 2000);
          } else {
            // ...if it matches, send a message specifying a callback too
            chrome.tabs.sendMessage(tab.id as number, {text: key}, handleResponse);
          }
        }, 5000);
      }
    }
  }
});
