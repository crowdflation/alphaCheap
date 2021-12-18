const vendor = 'zillow';
function parse(document) {
  const products = document.querySelectorAll('article.list-card');
  let result:any[] = [];
  let errors:any[] = [];
  [].forEach.call(products, function (product: any) {
    try {
      const price = product.querySelectorAll('.list-card-price')[0]?.innerText;
      const name = product.querySelectorAll('.list-card-details')[0].innerText;
      const pathname = new URL(document.URL).pathname;
      //Ignore if we don't have price data
      if (!price) {
        return;
      }
      const parsedData = {pathname, price, name};
      result.push(parsedData)
    }
    catch (e) {
      console.error('Did not parse one items', e);
      errors.push({error:e.toString(), stack: e.stack, element: product?.innerText});
    }
  });
  // Pass it back
  return{ data: result, vendor, errors };
}

const urlRegex = /^https?:\/\/(?:[^./?#]+\.)?zillow\.com\/homes\/*/;
export default {vendor, parse, urlRegex};