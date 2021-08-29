// TODO: Move this into separate file
import vendors from './vendors'


// Listen for messages from background script
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // If the received message has the expected format...
  // TODO: this should run different script depending on which page is being parsed
  // Add more vendors


  if (!vendors[msg.text]) {
    // TODO: Report the error
    console.log('Vendor not found');
    return;
  }

  vendors[msg.text].parse(document, sendResponse);

});