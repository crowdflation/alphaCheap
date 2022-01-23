import {SimpleCSSVendor} from './base';

export default new SimpleCSSVendor('apartments',
    'US',
    /^https?:\/\/(?:[^./?#]+\.)?apartments\.com\/*/,
    '.mortar-wrapper',
    {
        price: ['.property-pricing', 0],
        name: ['.property-beds', 0],
        description: ['.property-link', 0]
    }, ['name', 'price'], {pricePerUnit: 'price'});