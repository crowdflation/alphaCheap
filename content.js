// TODO: Move this into separate file
function parseWalmart(document, sendResponse) {
  const products = document.querySelectorAll('[data-automation-id="productTileDetails"]');
  let result = [];
  [].forEach.call(products, function (product) {
    const pricePerUnit = product.querySelectorAll('[data-automation-id="price-per-unit"]')[0]?.innerText;
    const price = product.querySelectorAll('[data-automation-id="price"] span')[1]?.innerText;
    const name = product.querySelectorAll('[data-automation-id="name"]')[0].innerText;
    //Ignore if we don't have price data
    if (!pricePerUnit && !price) {
      return;
    }
    const parsedData = {pricePerUnit, price, name};
    console.log(parsedData);
    result.push(parsedData);
  });
  // Pass it back
  sendResponse(JSON.stringify(result, null, 2));
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // If the received message has the expected format...
  // TODO: this should run different script depending on which page is being parsed
  if (msg.text === 'walmart') {
    // Parse the data
    parseWalmart(document, sendResponse);
  }
});