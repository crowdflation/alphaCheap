import vendors from './vendors';
import _ from 'lodash';
import axios from "axios";
import {SimpleCSSVendor} from "./vendors/base";

const NodeRSA = require('node-rsa');

let key: any = null;
let publicKey: any = null;
let publicKeySigned: any = null;
let walletAddress = null;
let walletPublicKey = null;

const serverUrl = 'https://www.crowdflation.io';
//const serverUrl = 'http://localhost:3000';

const readKey = (key: string): Promise<any> => {
  return new Promise((succ) => {
    chrome.storage.sync.get([key], function (result) {
      succ(result?.[key]);
    });
  });
};

const setKey = (key: string, val: any): Promise<any> => {
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
  return new Promise(function (succ: (any)) {
    if ('geolocation' in navigator) {
      console.log('Trying to get location');
      navigator.geolocation.getCurrentPosition(function (position) {
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

const showMessage = (message:string, isError?:boolean) => {

  let iconUrl = 'icon-big.png';
  chrome.notifications.create(
    {
      type: 'list',
      title: 'Alpha Cheap',
      message,
      priority: 2,
      items: [{ title: 'Alpha Cheap', message: message}],
      iconUrl
    }
  );
}

async function postData(url: string, data: any) {
  return axios.post(url, data);
}

async function getScrapers(url: string) {
  return axios.get(url);
}

const handleResponse = async (response) => {
  //ignore if its a different type of message
  if(!response || !response.type || response.type !=='parsed' ) {
    return;
  }

  let location: any = await getLocation();

  let {data, vendor, errors, document, products, url, country} = response;

  if(!country) {
    country = 'US';
  }



  // TODO: send  html that has failed to parse to server for analysis
  if (!data.length) {
    console.error('Failed to parse html');
    showMessage(`Failed to parse html for vendor ${vendor}. This error will be reported.`, true);
    // Check if there is an email
    if (document.search(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/) !== -1) {
      console.log("There is an email !");
      // Remove it...
      document = document.replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, "anynymiszed@email.com");
    }

    //TODO: Anonymize - remove any other potential PI
    postData(serverUrl + '/api/errors', { type: 'document-parse-error', vendor, document, errors, products, url});
    return;
  }

  const payload = {
    data,
    location: {longitude: location?.longitude, latitude: location?.latitude},
    date: new Date(),
    walletAddress,
    walletPublicKey,
    publicKey,
    publicKeySigned
  };

  const stringified = JSON.stringify(payload);

  // Sign data with users private key
  const signature = key.sign(stringified);

  const signed = {payload, signature: JSON.stringify(signature)};
  const sendTo = serverUrl + '/api/vendors/' + vendor + '/' + country;

  // Send data to website
  // TODO: This will send data to blockchain directly later on
  postData(sendTo, signed).then(()=> {
    showMessage(`Sent ${data.length} records to ${vendor} from wallet ${walletAddress}`);
    chrome.runtime.sendMessage({type:'data-sent'});
    /*chrome.runtime.sendMessage({imageURIs: l}, function(response) {
      console.log(response.farewell);
    });*/
  }).catch((err)=> {
    showMessage(`Failed to send data to the server for ${vendor}. Please check your connection or contact us on https://crowdflation.io or crowdflationinc@gmail.com`, true);
    console.error('Failed to send data to server', sendTo, signed, err);
    postData(serverUrl + '/api/errors', {
      errors: [err], message: 'Failed to send data to the server ' + sendTo,
      type: 'upload-error',
      url
    });
  });

  if (errors && errors.length) {
    postData(serverUrl + '/api/errors', {
      errors,
      details: {
        vendor,
        version: chrome.runtime.getManifest().version,
        walletAddress,
        publicKey,
        publicKeySigned,
        location: {longitude: location?.longitude, latitude: location?.latitude}
      },
      type: 'element-parse-error',
      url
    });
  }

};


const handleResponsePublicKey = async (response) => {
  if(!response || !response.type || response.type !=='signed' ) {
    return;
  }

  let parsed = response;
  publicKeySigned = parsed?.publicKeySigned;
  walletAddress = parsed?.walletAddress;
  walletPublicKey = parsed?.walletPublicKey;
  if (publicKeySigned && !_.isEmpty(publicKeySigned)) {
    await setKey('publicKeySigned', publicKeySigned);
    await setKey('walletAddress', walletAddress);
  } else {
    // FIXME: figure out why response is undefined
    publicKeySigned = {};
  }
};



chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  let scrapers = [];
  try {
    const response = await getScrapers(`${serverUrl}/api/scrapers`);
    scrapers = response.data.map((s) => s.scraper);
    scrapers.forEach((s:any)=> {
      vendors[s.name] = new SimpleCSSVendor(s.name, s.country, new RegExp(_.trim(s.urlRegex,'/')), s.itemSelector, s.parsers, s.requiredFields, s.copyFields);
    });
  } catch (e) {
    console.error(`Could not get scrapers from server ${e.toString()}`);
  }

  if (changeInfo?.status == 'complete') {
    for (let key in vendors) {
      const vendor = vendors[key];
      if (vendor.urlRegex.test(tab.url as string)) {
        // haven't figured out a better way to do this yet, so we just wait 5 seconds after page is loaded
        setTimeout(async () => {
          await keysLoaded;
          // ...if it matches, send a message specifying a callback too

          if (!publicKeySigned) {
            chrome.tabs.sendMessage(tab.id as number, {publicKey}, handleResponsePublicKey)

            const listener = function (request, sender, sendResponse) {
              handleResponsePublicKey(request);
              sendResponse({});
              chrome.runtime.onMessage.removeListener(listener);
            };

            chrome.runtime.onMessage.addListener(listener);

            const cancel = setInterval(() => {
              if (publicKeySigned) {
                if (_.isEmpty(publicKeySigned, true)) {
                  publicKeySigned = null;
                }
                clearInterval(cancel);
                chrome.tabs.sendMessage(tab.id as number, {text: key, scrapers}, handleResponse);
              }
            }, 2000);
          } else {
            // ...if it matches, send a message specifying a callback too
            chrome.tabs.sendMessage(tab.id as number, {text: key, scrapers}, handleResponse);
          }
        }, 5000);
      }
    }
  }
});
