import {IImage, INode, IVendor, ValueParser} from "./types";

export class BaseProductVendor implements IVendor{
  public constructor(name: string, country: string, urlRegex:RegExp, itemSelector:string, parsers: Record<string,ValueParser>, requiredFields:string[], copyFields:Record<string,string>) {
    this.urlRegex = urlRegex;
    this.itemSelector = itemSelector;
    this.parsers = parsers;
    this.requiredFields = requiredFields;
    this.name = name;
    this.copyFields = copyFields;
    this.country = country;
  }

  public readonly urlRegex;
  private readonly itemSelector: string
  private readonly parsers: Record<string,ValueParser>;
  private readonly requiredFields: string[];
  public readonly name: string;
  public readonly copyFields: Record<string,string>;
  public country: string;

  // TODO: reduce size, dont upload duplicates
  protected getBase64Image = (img:IImage, errors) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if(!ctx) {
      console.error('Failed getting 2d context');
      errors.push('Failed getting 2d context')
      return null;
    }
    ctx.drawImage(img as CanvasImageSource, 0, 0);
    const dataURL = canvas.toDataURL("image/png");
    return dataURL; //.replace(/^data:image\/(png|jpg);base64,/, "");
  }


  parse = (document: INode) => {
    const products = document.querySelectorAll(this.itemSelector);
    const that = this;
    let data:any[] = [];
    let errors:any[] = [];
    [].forEach.call(products, function (product: any, index: number) {
      try {
        const result = Object.keys(that.parsers).reduce( (res, key) => {
              if(key==='img') {
                res[key] = that.getBase64Image(that.parsers[key](product, index, document) as IImage, errors);
              } else {
                res[key] = that.parsers[key](product, index, document);
              }
              return res;
            },
            {}
        );

        Object.keys(that.copyFields).map((from)=> {
          const to = that.copyFields[from];
          if(!result[to]) {
            result[to] = result[from];
          }
        });

        if(that.requiredFields.find((f)=>!result[f])) {
          return;
        }
        data.push(result)
      }
      catch (e) {
        console.error('Did not parse one item', e);
        errors.push({error: e.toString(), stack: e.stack, element: product?.innerText});
      }
    });
    // Pass it back
    return { data, errors, vendor: that.name };
  }
}