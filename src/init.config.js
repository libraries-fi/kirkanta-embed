import config from '../config'

const BUILD_MODE = process.env.NODE_ENV
export default config(BUILD_MODE)
