// TODO: Move this into separate file
import vendors from './vendors'
//import detectEthereumProvider from '@metamask/detect-provider';

function injectCode(_injectedPublicKey) {
  var div=document.createElement("div");
  div.id = '_injectedPublicKey';
  document.body.appendChild(div);
  div.innerText=JSON.stringify(_injectedPublicKey);
  var script = document.createElement('script');
  var scriptPath = chrome.runtime.getURL('injected.js');
  script.setAttribute("src",scriptPath);
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}


// Listen for messages from background script
chrome.runtime.onMessage.addListener( async (msg, sender, sendResponse) => {
    if (msg.publicKey) {

      document.addEventListener('returnSignedCertificate', function (e: any) {
        var data = e.detail;
        if(!data.found) {
          // TODO: Make this visually nice
          alert('Please install and set up Metamask with Ethereum blockchain for your data to be signed and to earn rewards');
          sendResponse(JSON.stringify({
            publicKeySigned: {},
            walletAddress: null,
            walletPublicKey: null
          }, null, 2));
          return;
        }

        console.log('received', data)
        chrome.runtime.sendMessage(data, function() {
          console.log('publicKeySigned sent');
        });
      });

      injectCode(msg.publicKey);
      sendResponse();
      return;
    }

    // TODO: Add more vendors
    if (!vendors[msg.text]) {
      // TODO: Report the error
      console.log('Vendor not found');
      return;
    }

    vendors[msg.text].parse(document, sendResponse);
});