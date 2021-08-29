const vendor = 'walmart';
function parse(document, sendResponse) {
  const products = document.querySelectorAll('[data-automation-id="productTileDetails"]');
  let result:any[] = [];
  [].forEach.call(products, function (product: any) {
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

const urlRegex = /^https?:\/\/(?:[^./?#]+\.)?walmart\.com\/grocery\/*/;
const backend = 'https://mflation.herokuapp.com/api/walmart';
export default {vendor, parse, urlRegex, backend};