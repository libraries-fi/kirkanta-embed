import apiCall from "../mixins/api-call";

const AUTOCOMPLETE_LIMIT = 10;

function autocomplete(path, params) {
  let query = Object.assign({}, params, {
    limit: AUTOCOMPLETE_LIMIT,
  });
  return apiCall(path, "fi", query);
}

async function libraryAutoComplete(name) {
  if (name.length >= 2) {
    let response = await autocomplete("/library", {q: name, sort: "name"});
    return response.data.items;
  } else {
    return [];
  }
}

async function cityAutoComplete(name) {
  if (name.length >= 2) {
    let response = await autocomplete("/city", {name: name, sort: "name"});
    return response.data.items;
  } else {
    return [];
  }
}

async function consortiumAutoComplete(name) {
  if (name.length >= 2) {
    let response = await autocomplete("/consortium", {name: name, sort: "name"});
    return response.data.items;
  } else {
    return [];
  }
}

export { libraryAutoComplete, cityAutoComplete, consortiumAutoComplete };
