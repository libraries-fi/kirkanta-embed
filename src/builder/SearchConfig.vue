<template>
  <div class="custom-options" @change="onChange">
    <div class="details-group">
      <b-form-group id="option-city" label-for="o-city">
        <details>
          <summary>{{ $t("Choose municipalities") }}</summary>
          <small class="form-text">{{ $t("Restrict search to selected municipalities.") }}</small>
          <auto-complete id="o-city" name="x-city" :value-key="'id'" :label-key="'name'" v-model="options.city" :suggestions="citySuggestions" @input="onCityAutoComplete" :multiple="true"/>
        </details>
      </b-form-group>

      <b-form-group id="option-consortium" label-for="o-consortium">
        <details>
          <summary>{{ $t("Choose consortiums") }}</summary>
          <small class="form-text">{{ $t("Restrict search to selected consortiums.") }}</small>
          <auto-complete id="o-consortium" name="x-consortium" :value-key="'id'" :label-key="'name'" v-model="options.consortium" :suggestions="consortiumSuggestions" @input="onConsortiumAutoComplete" :multiple="true"/>
        </details>
      </b-form-group>

      <b-form-group id="option-library" label-for="o-library">
        <details>
          <summary>{{ $t("Choose libraries") }}</summary>
          <small class="form-text">{{ $t("Restrict available libraries.") }}</small>
          <auto-complete id="o-library" name="x-library" :value-key="'id'" :label-key="'name'" v-model="options.library" :suggestions="librarySuggestions" @input="onLibraryAutoComplete" :multiple="true"/>
        </details>
      </b-form-group>

      <b-form-group id="option-branch-type" label-for="o-branch-type">
        <details>
          <summary>{{ $t("Choose library types") }}</summary>
          <b-form-checkbox-group id="o-branch-type" name="branch_type" v-model="options.branch_type" :options="branchTypeOptions"/>
        </details>
      </b-form-group>
    </div>

    <div class="details-group">
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
  import AutoComplete from "./AutoComplete.vue";

  import { libraryAutoComplete, cityAutoComplete, consortiumAutoComplete } from "../mixins/autocomplete";

  export default {
    data: () => ({
      citySuggestions: [],
      cityValues: [],
      librarySuggestions: [],
      consortiumSuggestions: [],
      options: {
        library: null,
        city: null,
        consortium: null,
        branch_type: null,
      },
      // typeOptions: [
      //   { value: "library", text: "Library" },
      //   { value: "main_library", text: "Main library" },
      // ],
      branchTypeOptions: null
    }),
    created() {
      this.branchTypeOptions = [
        { value: "library main_library", text: this.$t("Municipal libraries") },
        { value: "mobile", text: this.$t("Mobile libraries") },
        // { value: "vocational_college", text: this.$t("Vocational college library") },
        { value: "polytechnic", text: this.$t("Polytechnic libraries") },
        { value: "university", text: this.$t("University libraries") },
        { value: "special", text: this.$t("Special libraries") },
        { value: "regional home_service institutional children school vocational_college", text: this.$t("Other") },
      ];
    },
    methods: {
      async onLibraryAutoComplete(name) {
        this.librarySuggestions = await libraryAutoComplete(name);
      },
      async onCityAutoComplete(name) {
        this.citySuggestions = await cityAutoComplete(name);
      },
      async onConsortiumAutoComplete(name) {
        this.consortiumSuggestions = await consortiumAutoComplete(name);
      },
      onSelectCity(city) {
        console.log("SELECTED", city);
        this.cityValues.push(city);
      },
      onChange(event) {
        this.$emit("options", this.options);
      }
    },
    watch: {
      cityValues() {
        this.options.city = this.cityValues.map((city) => city.id).join(" ");
      },
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
