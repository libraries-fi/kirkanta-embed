<template>
  <div class="has-autocomplete" :id="id + '-autocomplete'" @keyup.esc="onBlur()">
    <b-form-input :id="id || name" :name="name || id" @keyup.native="onKeyUp" @focus.native="onFocus" @blur.native="onBlur" :required="required" v-model="userInput"/>

    <ul class="autocomplete-popup" v-if="autoCompleteVisible && autoCompleteItems.length">
      <li class="autocomplete-option" v-for="(entry, i) in autoCompleteItems" tabindex="0" :data-i="i" @click="onClick" @keyup.enter="onClick" @focus.native="onFocus" @blur.native="onBlur">
        {{ entry[labelKey] }}
        <p v-if="entry[descriptionKey]">{{ entry[descriptionKey] }}</p>
      </li>
    </ul>

    <div class="values" v-if="multiple">
      <span class="badge badge-info mr-1" v-for="(entry, i) in selected">
        {{ entry[labelKey] }}
        <button type="button" class="close" @click="removeOption(i)" data-i="i">
          <span aria-hidden="true">&times;</span>
        </button>
      </span>
    </div>
  </div>
</template>

<script>
  const USER_INPUT_TIMEOUT = 300;
  const BLUR_TIMEOUT = 300;

  function accepts(input, entry) {
    return entry == input;
  }

  export default {
    props: ["id", "name", "value", "suggestions", "valueKey", "labelKey", "descriptionKey", "required", "multiple"],
    model: {
      prop: "value",
      event: "change"
    },
    data: () => ({
      inputTimer: null,
      blurTimer: null,
      userInput: "",
      autoCompleteItems: [],
      autoCompleteVisible: false,
      selected: [],
    }),
    // computed: {
    //   value() {
    //     let values = this.selected.map((entry) => entry[this.valueKey]);
    //     return this.multiple ? values : values[0];
    //   }
    // },
    methods: {
      noop(event) {
        event.preventDefault();
      },
      filterSuggestions: function() {
        let callback = this.filter || accepts;

        this.autoCompleteItems = this.data.filter((entry) => {
          if (this.filter) {
            return this.filter(this.userInput, entry);
          } else {
            return accepts(this.userInput, entry[this.labelKey]);
          }
        });
      },
      onClick(event) {
        this.onSelectItem(event.target.dataset.i);
        this.onBlur();
      },
      onSelectItem(i) {
        let entry = this.autoCompleteItems[i];
        if (this.multiple) {
          this.selected.push(entry);
          this.userInput = "";
        } else {
          this.selected.pop();
          this.selected.push(entry);
          this.userInput = entry[this.labelKey];
        }

        this.$emit("select", entry);
      },
      onKeyUp(event) {
        this.onInput(event.target.value);
      },
      onInput(value) {
        if (this.inputTimer) {
          this.inputTimer = clearTimeout(this.inputTimer);
        }

        this.inputTimer = setTimeout(() => {
          this.$emit("input", value);
          this.inputTimer = null;
        }, USER_INPUT_TIMEOUT);
      },
      onFocus() {
        // console.log("FOCUS");
        this.autoCompleteVisible = true;

        if (this.blurTimer) {
          this.blurTimer = clearTimeout(this.blurTimer);
        }
      },
      onBlur() {
        // console.log("BLUR");

        if (!this.blurTimer) {
          this.blurTimer = setTimeout(() => {
            this.autoCompleteVisible = false;
          }, BLUR_TIMEOUT);
        }
      },
      removeOption(i) {
        // let i = event.currentTarget.dataset.i;
        console.log("REMOVE", i, this.selected[i]);
        this.selected.splice(i, 1);
      }
    },
    watch: {
      selected: function(selected) {
        let values = selected.map((entry) => entry[this.valueKey]);
        let value = this.multiple ? values : values[0];
        // this.value = this.multiple ? values : values[0];

        this.$emit("change", value);
      },
      suggestions: function(entries) {
        this.autoCompleteItems = entries;
      }
    }
  };
</script>

<style lang="scss">
  @import "../../scss/builder/variables";

  $zindex-modal: 1050 !default;

  .has-autocomplete {
    position: relative;

    .badge {
      button {
        background: none;
        border: none;
        margin-left: 0.3rem;
        margin-right: 0.1rem;
        color: white;
      }
    }

    .autocomplete-popup {
      position: absolute;
      box-shadow: 0 0 5px #555;
      padding: 0;
      margin: 0;
      list-style-type: none;
      z-index: $zindex-modal;

      .autocomplete-option {
        &:hover {
          background-color: $primary;
          color: white;
          cursor: default;
        }
      }
    }

    .values {
      .placeholder {
        max-width: 0px;
        padding-left: 0;
        padding-right: 0;
        overflow: hidden;
        visibility: hidden;
      }
    }
  }
</style>
