const BUILD_MODE = process.env.NODE_ENV;

import config from '../config';
export default config(BUILD_MODE);
