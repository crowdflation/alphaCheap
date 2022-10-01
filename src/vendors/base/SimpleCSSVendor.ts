import {BaseProductVendor} from './BaseProductVendor'
import {CSSIndex, INode, ValueParser} from "./types";
export class SimpleCSSVendor extends BaseProductVendor {
    public constructor(name:string, country: string, urlRegex:RegExp, itemSelector:string, parsers: Record<string,CSSIndex>, requiredFields:string[], copyFields:Record<string,string>) {
        super(name, country, urlRegex, itemSelector, Object.keys(parsers).reduce( (res, key) => {
                res[key] = SimpleCSSVendor.simpleCSSParser(parsers[key][0], parsers[key][1])
                return res;
            },
            {}
        ), requiredFields, copyFields);
    }

    static simpleCSSParser = (css:string, position: number) : ValueParser => {
        return (item: INode) => {
            const parsed = item.querySelectorAll(css);
            if(parsed.length<=position) {
                return undefined;
            }
            return parsed[position]?.innerText;
        };
    }
}