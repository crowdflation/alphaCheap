import {INode} from "./base/types";
import {BaseProductVendor} from './base';
import _ from "lodash";

export default new BaseProductVendor('bestbuy',
    'US',
    /^https?:\/\/(?:[^./?#]+\.)?bestbuy\.com\/site\/searchpage\.jsp\?st\=.*/,
    '.sku-item',
    {
        name: (item: INode, index?: number) => {
            return item.querySelectorAll('.sku-header')[0].innerText;
        }, price: (item: INode, index?: number) => {
            return item.querySelectorAll('.priceView-hero-price priceView-customer-price\t')[0]?.innerText;
        },
        notSoldOut: (item: INode, index?: number) => {
            return _.includes(item[0].innerText, "Sold Out")?'':'In Stock';
        }
    }, ['name', 'price', 'notSoldOut'], {});

