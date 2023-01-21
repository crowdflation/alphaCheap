export interface IVendor {
    parse: (document) => any;
    urlRegex: RegExp;
    country?:string;
    name: string;
};

export interface INode {
    querySelectorAll: (key:string) => INode[];
    querySelector: (key:string) => INode[];
    innerText: string;
}

export interface IImage {
    src: string;
}

export type ValueParser = (item: INode, index?: number,  document?: INode) => string | number | undefined | IImage;

export type CSSIndex = [string, number];