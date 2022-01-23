import {INode} from "./base/types";
import {BaseProductVendor} from './base';

export default new BaseProductVendor('zillow',
    'US',
    /^https?:\/\/(?:[^./?#]+\.)?zillow\.com\/homes\/*/,
    'article.list-card',
    {
        name: (item: INode, index?: number) => {
            return item.querySelectorAll('.list-card-details')[0].innerText;
        }, price: (item: INode, index?: number) => {
            return item.querySelectorAll('.list-card-price')[0]?.innerText;
        },
        pathname: (item: INode, index?: number) => {
            return new URL(document.URL).pathname;
        }
    }, ['name', 'price'], {pricePerUnit: 'price'});


