const vendor = 'doordash';
function parse(document) {
  const products = document.querySelectorAll('[data-anchor-id="MenuItem"]');
  let result:any[] = [];
  let errors:any[] = [];
  [].forEach.call(products, function (product: any) {
    try {
      const price = product.querySelectorAll('[data-anchor-id="StoreMenuItemPrice"]')[0]?.innerText;
      const name = product.querySelectorAll('[data-testid="GenericItemCard"] > div> div >span')[0].innerText;
      const description = product.querySelectorAll('[data-anchor-id="MenuItem"] > button > div > div > div > span > div > div > div:nth-child(2) > span')[0]?.innerText;
      //Ignore if we don't have price data
      if (!price) {
        return;
      }
      const parsedData = {description, price, name};
      result.push(parsedData)
    }
    catch (e) {
      console.error('Did not parse one items', e);
      errors.push({error:e.toString(), stack: e.stack, element: product?.innerText});
    }
  });
  // Pass it back
  return{ data: result, vendor, errors, products };
}

const urlRegex = /^https?:\/\/(?:[^./?#]+\.)?doordash\.com\/store\/*/;
export default {vendor, parse, urlRegex};
