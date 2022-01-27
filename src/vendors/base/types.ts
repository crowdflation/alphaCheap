export interface IVendor {
    parse: (document) => any;
    urlRegex: RegExp;
    country?:string;
    name: string;
};

export interface INode {
    querySelectorAll: (key:string) => INode[];
    innerText: string;
}

export type ValueParser = (item: INode, index?: number,  document?: INode) => string | number | undefined;

export type CSSIndex = [string, number];