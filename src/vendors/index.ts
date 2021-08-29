interface IVendor {
  parse: (document, sendResponse) => void;
  urlRegex: RegExp;
  backend: string;
};

import kroger from './kroger';
import walmart from './walmart';

export default {kroger, walmart} as {[name:string]:IVendor};