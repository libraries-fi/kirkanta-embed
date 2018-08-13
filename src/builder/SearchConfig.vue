<template>
  <div class="custom-options" @change="onChange">
    <div class="details-group">
      <b-form-group id="option-city" label-for="o-city">
        <details>
          <summary>Choose municipalities</summary>
          <small class="form-text">Restrict search to selected municipalities.</small>
          <auto-complete id="o-city" name="x-city" :value-key="'id'" :label-key="'name'" v-model="options.city" :suggestions="citySuggestions" @input="onCityAutoComplete" :multiple="true"/>

          <!-- <span class="badge badge-info" v-for="city in cityValues">{{ city.name }}</span> -->
        </details>
      </b-form-group>

      <b-form-group id="option-consortium" label-for="o-consortium">
        <details>
          <summary>Choose consortiums</summary>
          <small class="form-text">Restrict search to selected consortiums.</small>
          <auto-complete id="o-consortium" name="x-consortium" :value-key="'id'" :label-key="'name'" v-model="options.consortium" :suggestions="consortiumSuggestions" @input="onConsortiumAutoComplete" :multiple="true"/>

          <!-- <span class="badge badge-info" v-for="consortium in consortiumValues">{{ consortium.name }}</span> -->
        </details>
      </b-form-group>

      <b-form-group id="option-library" label-for="o-library">
        <details>
          <summary>Choose libraries</summary>
          <small class="form-text">Restrict available libraries.</small>
          <auto-complete id="o-library" name="x-library" :value-key="'id'" :label-key="'name'" v-model="options.library" :suggestions="librarySuggestions" @input="onLibraryAutoComplete" :multiple="true"/>
        </details>
      </b-form-group>

      <b-form-group id="option-branch-type" label-for="o-branch-type">
        <!-- <b-form-select id="o-branch-type" name="branch_type" v-model="options.branch_type" :options="branchTypeOptions"/> -->
        <details>
          <summary>Choose branch types</summary>
          <b-form-checkbox-group id="o-branch-type" name="branch_type" v-model="options.branch_type" :options="branchTypeOptions"/>
        </details>
      </b-form-group>
    </div>

    <div class="form-group">
      <b-form-checkbox id="o-tabbed" v-model="options.tabbed">Use tabs on library page</b-form-checkbox>
      <small class="form-text">Group library page sections in tabs.</small>
    </div>
    <!--
    <b-form-group id="option-type" label="Library type" label-for="o-type">
      <b-form-select id="o-type" name="type" v-model="options.type" :options="typeOptions"/>
    </b-form-group>
    -->

    <!--
    <b-form-group id="option-branch-type" label="Branch type" label-for="o-branch-type">
      <b-form-checkbox-group id="o-branch-type" name="branch_type" v-model="options.branch_type" :options="branchTypeOptions"/>
    </b-form-group>
  -->
  </div>
</template>

<script>
  import AutoComplete from "./AutoComplete.vue";

  import { libraryAutoComplete, cityAutoComplete, consortiumAutoComplete } from "../utils/autocomplete";

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
      branchTypeOptions: [
        // { value: null, text: "- Any -" },
        // { value: "library", text: "Library" },
        // { value: "main_library", text: "Main library" },
        // { value: "regional", text: "Regional library" },
        // { value: "mobile", text: "Mobile library" },
        // { value: "home_service", text: "Home service" },
        // { value: "institutional", text: "Institutional library" },
        // { value: "children", text: "Children's library" },
        // { value: "music", text: "Music library" },
        // { value: "special", text: "Special library" },
        // { value: "vocational_college", text: "Vocational college library" },
        // { value: "school", text: "School library" },
        // { value: "polytechnic", text: "Polytechnic library" },
        // { value: "university", text: "University library" },
        // { value: "other", text: "Other library organisation" },



        { value: "library main_library", text: "Regular libraries" },
        { value: "mobile", text: "Mobile libraries" },
        // { value: "vocational_college", text: "Vocational college library" },
        { value: "polytechnic", text: "Polytechnic libraries" },
        { value: "university", text: "University libraries" },
        { value: "special", text: "Special libraries" },
        { value: "regional home_service institutional children school vocational_college", text: "Other" },
      ]
    }),
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
