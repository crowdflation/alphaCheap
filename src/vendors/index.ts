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

export default {kroger, walmart, zillow, macys, doordash} as {[name:string]:IVendor};
