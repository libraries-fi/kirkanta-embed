
import axios from "axios";
import config from "../init.config";

async function apiCall(path, lang, query) {
  let params = {lang: lang};
  Object.assign(params, query);

  return axios.get(config.api + path, {params: params});
}

export default apiCall;
