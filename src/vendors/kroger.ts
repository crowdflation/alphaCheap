const vendor = 'kroger';
function parse(document, sendResponse) {
  const products = document.querySelectorAll('[data-qa*="product-card-"]');
  let result:any[] = [];
  [].forEach.call(products, function (product:any) {
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

const urlRegex = /^https?:\/\/(?:[^./?#]+\.)?kroger\.com\/search*/;
export default {vendor, parse, urlRegex};