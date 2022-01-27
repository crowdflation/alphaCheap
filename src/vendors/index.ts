interface IVendor {
  parse: (document) => any;
  urlRegex: RegExp;
  country?:string;
};

import kroger from './kroger';
import zillow from './zillow';
import macys from './macys';

export default {kroger, zillow, macys} as {[name:string]:IVendor};
