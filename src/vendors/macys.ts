import {INode} from "./base/types";
import {BaseProductVendor} from './base';

export default new BaseProductVendor('macys',
    'US',
    /^https?:\/\/(?:[^./?#]+\.)?macys\.com\/shop\/*/,
    'div.productDetail',
    {
        name: (item: INode, index?: number) => {
            return item.querySelectorAll('div.productDescription > a')[0].innerText;
        }, price: (item: INode, index?: number) => {
            let price = item.querySelectorAll('.priceInfo .discount')[0]?.innerText;
            if (!price) {
                price = item.querySelectorAll('.priceInfo .regular')[1]?.innerText;
            }
            return price;
        },
        originalPrice: (item: INode, index?: number) => {
            return item.querySelectorAll('.priceInfo .regular')[0]?.innerText;
        },
        brand: (item: INode, index?: number) => {
            return item.querySelectorAll('div.productBrand')[0].innerText;
        },
        pathname: (item: INode, index?: number) => {
            return new URL(document.URL).pathname;
        }
    }, ['name', 'price'], {pricePerUnit: 'price'});


