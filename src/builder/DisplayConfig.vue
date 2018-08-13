<template>
  <div class="custom-options">
    <b-form-group id="option-library" label="Library" label-for="o-library">
      <auto-complete id="o-library" name="x-library" :value-key="'id'" :label-key="'name'" v-model="options.library" :suggestions="librarySuggestions" @input="onLibraryAutoComplete" required/>
    </b-form-group>

    <div class="form-group">
      <b-form-checkbox id="o-tabbed" v-model="options.tabbed">Tabbed interface</b-form-checkbox>
      <small class="form-text">Group library page sections in tabs.</small>
    </div>
  </div>
</template>

<script>
  import apiCall from "../utils/api-call";
  import AutoComplete from "./AutoComplete.vue";

  const AUTOCOMPLETE_LIMIT = 10;

  function autocomplete(path, params) {
    let query = Object.assign({}, params, {
      limit: AUTOCOMPLETE_LIMIT,
    });
    return apiCall(path, "fi", query);
  }

  export default {
    data: () => ({
      librarySuggestions: [],
      options: {
        library: null,
        tabbed: false,
      },
    }),
    methods: {
      async onLibraryAutoComplete(name) {
        if (name.length >= 2) {
          let result = await apiCall("/library", "fi", {q: name, sort: "name", limit: AUTOCOMPLETE_LIMIT});
          this.librarySuggestions = result.data.items;
        }
      },
    },
    watch: {
      options: {
        handler() {
          this.$emit("options", this.options);
        },
        deep: true
      }
    },
    components: { AutoComplete }
  };
</script>
