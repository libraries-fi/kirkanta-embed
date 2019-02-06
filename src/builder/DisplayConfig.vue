<template>
  <div class="custom-options">
    <div class="details-group">
      <b-form-group id="option-library">
        <details>
          <summary>{{ $t("Basic settings") }}</summary>
          <label for="o-library">{{ $t("Library") }}</label>
          <auto-complete id="o-library" name="x-library" :value-key="'id'" :label-key="'name'" v-model="options.library" :suggestions="librarySuggestions" @input="onLibraryAutoComplete" required/>
        </details>
      </b-form-group>

      <b-form-group id="o-expand-mode">
        <details>
          <summary>{{ $t("Schedules") }}</summary>
          <span class="section-label">{{ $t("Expand schedules") }}</span>
          <b-form-radio-group v-model="options.expandMode">
            <b-form-radio :value="null">{{ $t("None") }}</b-form-radio>
            <b-form-radio value="current">{{ $t("Current day only") }}</b-form-radio>
            <b-form-radio value="all">{{ $t("All days") }}</b-form-radio>
          </b-form-radio-group>
        </details>
      </b-form-group>
    </div>
  </div>
</template>

<script>
  import apiCall from "../mixins/api-call";
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
