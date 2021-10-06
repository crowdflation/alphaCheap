const vendor = 'macys';
function parse(document, sendResponse) {
  const products = document.querySelectorAll('div.productDetail');
  let result:any[] = [];
  [].forEach.call(products, function (product: any) {
    try {
      const originalPrice = product.querySelectorAll('.priceInfo .regular')[0]?.innerText;
      let price = product.querySelectorAll('.priceInfo .discount')[0]?.innerText;
      if (!price){
        price = product.querySelectorAll('.priceInfo .regular')[1]?.innerText;
      }
      const name = product.querySelectorAll('div.productDescription > a')[0].innerText;
      const brand = product.querySelectorAll('div.productBrand')[0].innerText;
      //Ignore if we don't have price data
      if (!originalPrice&&!price) {
        return;
      }
      const parsedData = {originalPrice, price, brand, name};
      result.push(parsedData)
    }
    catch (e) {
      console.error('Did not parse one items', e);
    }
  });
  // Pass it back
  sendResponse(JSON.stringify({ data: result, vendor}, null, 2));
}

const urlRegex = /^https?:\/\/(?:[^./?#]+\.)?macys\.com\/shop\/*/;
const backend = 'https://mflation.herokuapp.com/api/macys';
export default {vendor, parse, urlRegex, backend};
