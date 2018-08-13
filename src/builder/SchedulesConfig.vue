<template>
  <div class="custom-options">
    <b-form-group id="option-library" label="Library" label-for="o-library">
      <auto-complete id="o-library" name="x-library" :value-key="'id'" :label-key="'name'" v-model="options.library" :suggestions="librarySuggestions" @input="onLibraryAutoComplete" required/>
    </b-form-group>

    <b-form-group id="o-expand-mode" label="Expand day rows">
      <b-form-radio-group v-model="options.expandMode">
        <b-form-radio :value="null">Only current day</b-form-radio>
        <b-form-radio value="all">All rows</b-form-radio>
        <b-form-radio value="none">None</b-form-radio>
      </b-form-radio-group>
    </b-form-group>
  </div>
</template>

<script>
  import apiCall from "../utils/api-call";
  import AutoComplete from "./AutoComplete.vue";

  const AUTOCOMPLETE_LIMIT = 10;

  export default {
    data: () => ({
      librarySuggestions: [],
      libraryValues: [],
      options: {
        expandMode: null,
        library: null,
      },
    }),
    methods: {
      onSelectLibrary(library) {
        this.options.library = library.id;
      },
      async onLibraryAutoComplete(value) {
        if (value.length >= 2) {
          let response = await apiCall("/library", "fi", {q: value, sort: "name", limit: AUTOCOMPLETE_LIMIT});

          this.librarySuggestions = response.data.items;
        } else {
          this.librarySuggestions = [];
        }
      }
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
