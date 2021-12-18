const vendor = 'kroger';
function parse(document) {
  const products = document.querySelectorAll('[data-qa*="product-card-"]');
  let result:any[] = [];
  let errors:any[] = [];
  [].forEach.call(products, function (product:any) {
    try {
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
    }
    catch (e) {
      console.error('Did not parse one items', e);
      errors.push(e);
    }
  });
  // Pass it back
  return { data: result, vendor, errors };
}

const urlRegex = /^https?:\/\/(?:[^./?#]+\.)?kroger\.com\/search*/;
export default {vendor, parse, urlRegex};