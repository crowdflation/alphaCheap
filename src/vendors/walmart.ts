const vendor = 'walmart';
function parse(document, sendResponse) {
  const products = document.querySelectorAll('div > div > div.flex.flex-column.justify-center > section > div > div> div > div');
  let result:any[] = [];
  [].forEach.call(products, function (product: any) {
    try {
      const pricePerUnit = product.querySelectorAll('div.flex.flex-wrap.justify-start.items-center.lh-title.mb2.mb1-m > div.f7.f6-l.gray.mr1')[0]?.innerText;
      const price = product.querySelectorAll('div.b.black.f5.mr1.mr2-xl.lh-copy.f4-l')[0]?.innerText;
      const name = product.querySelectorAll('span > span')[0].innerText;
      //Ignore if we don't have price data
      if (!pricePerUnit && !price) {
        return;
      }
      const parsedData = {pricePerUnit, price, name};
      result.push(parsedData)
    }
    catch (e) {
      console.error('Did not parse one items', e);
    }
  });
  // Pass it back
  sendResponse(JSON.stringify({ data: result, vendor}, null, 2));
}

const urlRegex = /^https?:\/\/(?:[^./?#]+\.)?walmart\.com\/*/;
const backend = 'https://mflation.herokuapp.com/api/walmart';
export default {vendor, parse, urlRegex, backend};