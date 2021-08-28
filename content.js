// TODO: Move this into separate file
function parseWalmart(document, sendResponse, vendor) {
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
    result.push(parsedData);
  });
  // Pass it back
  sendResponse(JSON.stringify({ data: result, vendor}, null, 2));
}

function parseKroger(document, sendResponse, vendor) {
  const products = document.querySelectorAll('[data-qa*="product-card-"]');
  let result = [];
  [].forEach.call(products, function (product) {
    const price = product.querySelectorAll('[data-qa="cart-page-item-unit-price"]')[0]?.innerText;
    const nameAndPrice = product.querySelectorAll('[data-qa="cart-page-item-description"]')[0].innerText;
    const name = nameAndPrice.split(' - ')[0];
    const pricePerUnit = nameAndPrice.split(' - ')[1];

    //Ignore if we don't have price data
    if (!pricePerUnit && !price) {
      return;
    }
    const parsedData = {pricePerUnit, price, name};
    result.push(parsedData);
  });
  // Pass it back
  sendResponse(JSON.stringify({ data: result, vendor}, null, 2));
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // If the received message has the expected format...
  // TODO: this should run different script depending on which page is being parsed
  // Add more vendors
  if (msg.text === 'walmart') {
    // Parse the data
    parseWalmart(document, sendResponse, 'walmart');
  } else if (msg.text === 'kroger') {
    // Parse the data
    parseKroger(document, sendResponse, 'kroger');
  }

});