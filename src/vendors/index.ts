interface IVendor {
  parse: (document) => any;
  urlRegex: RegExp;
  country?:string;
};

import kroger from './kroger';
import walmart from './walmart';
import zillow from './zillow';
import macys from './macys';
import doordash from './doordash';
import albertsons from "./albertsons";
import apartments from "./apartments";

export default {kroger, walmart, zillow, macys, doordash, albertsons, apartments} as {[name:string]:IVendor};
