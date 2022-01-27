import {INode} from "./base/types";
import {BaseProductVendor} from './base';

export default new BaseProductVendor('goodrx',
    'US',
    /^https?:\/\/(?:[^./?#]+\.)?goodrx\.com\/.*/,
    '[data-qa="price_row"]',
    {
        name: (item: INode, index?: number, document?: INode) => {
            return document && document.querySelectorAll('#uat-drug-title')[0].innerText;
        }, price: (item: INode, index?: number) => {
            return item.querySelectorAll('[data-qa="drug_price"]')[0]?.innerText;
        },
        originalPrice: (item: INode, index?: number) => {
            return item.querySelectorAll('.priceInfo .regular')[0]?.innerText;
        },
        discount: (item: INode, index?: number) => {
            return item.querySelectorAll('[data-qa="cash_price"]')[0].innerText;
        }
    }, ['name', 'price'], {});

