import {SimpleCSSVendor} from './base';

export default new SimpleCSSVendor('albertsons',
    'US',
    /^https?:\/\/(?:[^./?#]+\.)?albertsons\.com\/shop\/search\-results\.html\?q=*/,
    'product-item-v2',
    {
      pricePerUnit: ['.product-price-qty', 0],
      price: ['.product-price', 0],
      name: ['.product-title', 0],
      discount: ['.single-coupon-details>div', 0]
    }, ['name', 'price'], {pricePerUnit: 'price'});