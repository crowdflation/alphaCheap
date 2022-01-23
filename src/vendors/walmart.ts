import {SimpleCSSVendor} from './base';

export default new SimpleCSSVendor('walmart',
    'US',
    /^https?:\/\/(?:[^./?#]+\.)?walmart\.com\/*/,
    'div > div > div.flex.flex-column.justify-center > section > div > div> div > div',
    {
        pricePerUnit: ['div.flex.flex-wrap.justify-start.items-center.lh-title.mb2.mb1-m > div.f7.f6-l.gray.mr1', 0],
        price: ['div.b.black.f5.mr1.mr2-xl.lh-copy.f4-l', 0],
        name: ['span > span', 0]
    }, ['name', 'price'], {pricePerUnit: 'price'});