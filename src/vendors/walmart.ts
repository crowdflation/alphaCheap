const vendor = 'walmart';

function parse(document) {
  const products = document.querySelectorAll('div > div > div.flex.flex-column.justify-center > section > div > div> div > div');
  let result:any[] = [];
  let errors:any[] = [];
  [].forEach.call(products, function (product: any) {
    try {
      const pricePerUnit = product.querySelectorAll('div.flex.flex-wrap.justify-start.items-center.lh-title.mb2.mb1-m > div.f7.f6-l.gray.mr1')[0]?.innerText;
      let price = product.querySelectorAll('div.b.black.f5.mr1.mr2-xl.lh-copy.f4-l')[0]?.innerText;
      const name = product.querySelectorAll('span > span')[0].innerText;
      //Ignore if we don't have price data
      if (!pricePerUnit && !price) {
        return;
      }

      if(!price) {
        price = pricePerUnit;
      }

      const parsedData = {pricePerUnit, price, name};
      result.push(parsedData)
    }
    catch (e) {
      console.error('Did not parse one item', e);
      errors.push({error:e.toString(), stack: e.stack, element: product?.innerText});
    }
  });
  // Pass it back
  return { data: result, vendor, errors };
}

const urlRegex = /^https?:\/\/(?:[^./?#]+\.)?walmart\.com\/*/;
export default {vendor, parse, urlRegex, country: 'US'};