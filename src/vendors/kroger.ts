import {IImage, INode} from "./base/types";
import {BaseProductVendor} from './base';

export default new BaseProductVendor('kroger',
    'US',
    /^https?:\/\/(?:[^./?#]+\.)?kroger\.com\/search*/,
    '[data-qa*="product-card-"]',
    {
        name: (item: INode, index?: number) => {
            return item.querySelectorAll('[data-qa="cart-page-item-description"]')[0].innerText.split(' - ')[0];
        }, price: (item: INode, index?: number) => {
            return item.querySelectorAll('[data-qa="cart-page-item-unit-price"]')[0]?.innerText
        },
        pricePerUnit: (item: INode, index?: number) => {
            return item.querySelectorAll('[data-qa="cart-page-item-description"]')[0].innerText.split(' - ')[1];
        },
        img: (item: INode, index?: number) => {
            return item.querySelectorAll('[data-qa="cart-page-item-image-loaded"]')[0] as unknown as IImage;
        }
    }, ['name', 'price'], {pricePerUnit: 'price'});

