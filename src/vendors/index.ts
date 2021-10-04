interface IVendor {
  parse: (document, sendResponse) => void;
  urlRegex: RegExp;
  backend: string;
};

import kroger from './kroger';
import walmart from './walmart';
import zillow from './zillow';
import macys from './macys';
import doordash from './doordash';

export default {kroger, walmart, zillow} as {[name:string]:IVendor};
