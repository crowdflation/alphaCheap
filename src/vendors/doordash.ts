import {SimpleCSSVendor} from './base';
export default new SimpleCSSVendor('doordash',
    'US',
    /^https?:\/\/(?:[^./?#]+\.)?doordash\.com\/store\/*/,
    '[data-anchor-id="MenuItem"]',
    {
      description: ['[data-anchor-id="MenuItem"] > button > div > div > div > span > div > div > div:nth-child(2) > span', 0],
      price: ['[data-anchor-id="StoreMenuItemPrice"]', 0],
      name: ['[data-testid="GenericItemCard"]', 0]
    }, ['name', 'price'], {});
