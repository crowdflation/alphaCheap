import {IImage, INode, IVendor, ValueParser} from "./types";

const getCssSelector = (el) => {
  let path = [], parent;
  while (parent = el?.parentNode) {
    // @ts-ignore
    path.unshift(`${el.tagName}:nth-child(${[].indexOf.call(parent.children, el)+1})`);
    el = parent;
  }
  return `${path.join(' > ')}`.toLowerCase();
};

//function to inject javascript script contents into the page
export function injectScript(document, scriptContents) {
  const script = document.createElement('script');
  script.textContent = scriptContents;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}



//use injectScript to get the contents of an image from page encoded as base64 by its css selector
function injectGetImageBase64(document, selector, src, callback) {
  console.log('src', src, selector);
  // is this a data url?
  if (src.startsWith('data:')) {
    return;
  }

  var scriptContents = `
    var img = document.querySelector('${selector}');
    // create new image
    var newImg = new Image();
    newImg.crossOrigin = "anonymous";
    newImg.src = '${src}';
    newImg.selector = '${selector}';
    var loadedFunction = function(e){
      var loadedImg = e.target;
      var id = loadedImg.selector;
      var origin = img.crossOrigin;
      var canvas = document.createElement('canvas');
      canvas.width = loadedImg.width;
      canvas.height = loadedImg.height;
      var ctx = canvas.getContext('2d');
      try {
        ctx.drawImage(loadedImg, 0, 0);
        // check canvas has painted pixels
        var data = ctx.getImageData(0, 0, 1, 1).data;
        if (data[3] === 0) {
            console.log('no pixels painted');
        } else {
          var dataURL = canvas.toDataURL('image/png');
          var event = new CustomEvent('getImageBase64', { detail: { id: id, dataURL: dataURL } });
          document.dispatchEvent(event);
        }
      } catch (e) {
        //Canvas tainted
        console.log('Canvas tainted');
      }
    };
    newImg.onload = loadedFunction;
    `;

  document.addEventListener('getImageBase64', function (e: any) {
    if (e.detail.id === selector) {
      callback(e.detail.dataURL);
      //remove listener after it has been called
      document.removeEventListener('getImageBase64', e.callee);
    }
  }, {wantsUntrusted:true});
  injectScript(document, scriptContents);
}

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

  // returns true if every pixel's uint32 representation is 0 (or "blank")
  isCanvasBlank = (context, canvas) => {

    const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );

    return !pixelBuffer.some(color => color !== 0);
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
                try {
                  const image = that.parsers[key](product, index, document) as IImage;
                  const selector = getCssSelector(image);
                  injectGetImageBase64(document, selector, image.src, function (dataURL) {
                    res[key] = dataURL;
                  });
                } catch (e) {
                  errors.push(e);
                  //console.log('Could not parse image', e);
                }
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
        //console.error('Did not parse one item', e);
        errors.push({error: e.toString(), stack: e.stack, element: product?.innerText});
      }
    });
    // Pass it back
    return { data, errors, vendor: that.name };
  }
}