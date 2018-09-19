<template>
  <div id="builder">
      <div id="factory">
        <form @submit="onSubmit">
          <div class="form-group" id="select-widget">
            <b-form-select v-model="widget" :options="availableWidgets"/>
          </div>

          <fieldset class="options" v-if="widget">
            <legend>{{ $t("Options") }}</legend>

            <router-view @options="onWidgetOptions"/>

            <b-form-group id="option-lang" :label="$t('Language')" label-for="o-lang">
              <b-form-select id="o-lang" v-model="options.lang" :options="languageOptions"/>
            </b-form-group>

            <!-- <div class="form-group">
              <b-form-checkbox id="o-nosandbox" v-model="options.nosandbox">
                Advanced mode
              </b-form-checkbox>
            </div> -->

            <div class="form-group">
              <!-- <button type="submit" class="btn btn-primary">{{ $t("Refresh") }}</button> -->
              <button type="button" class="btn btn-link" @click="state.customizeCss = true">{{ $t("Custom style") }}</button>
            </div>
          </fieldset>
        </form>
      </div>

      <div id="right-side" class="bg-bubbles">
        <div id="custom-css-popup" v-if="state.customizeCss">
          <b-textarea id="custom-css" v-model="customCss" rows="10"/>
          <div class="mt-3">
            <button type="button" class="btn btn-primary" @click="acceptCustomCss()">{{ $t("Save") }}</button>
          </div>
        </div>

        <details id="output" class="bg-cogs" v-if="output">
          <summary class="bg-gradient-warning">{{ $t("View embed code") }}</summary>

          <!-- NOTE: Copying works only when the textarea is actually visible. -->
          <button type="button" class="btn btn-success btn-sm" data-copy-code data-clipboard-target="#output-value">
            <font-awesome-icon :icon="faClone"/>
            {{ $t("Copy") }}
          </button>

          <div>
            <b-textarea id="output-value" v-if="output" v-model="output" rows="4"/>
          </div>
        </details>

        <div id="preview-container" class="p-lg-3">
          <template v-if="output">
            <span class="badge badge-lg badge-info">{{ $t("Preview") }}</span>
            <div id="preview" v-html="output"/>
          </template>
          <template v-else>
            <div id="builder-guide" class="col">
              <h1>{{ $t("Widget builder") }}</h1>
              <p>{{ $t("help.intro") }}</p>
              <ol>
                <li>{{ $t("help.bulletins.p1") }}</li>
                <li>{{ $t("help.bulletins.p2") }}</li>
                <li>{{ $t("help.bulletins.p3") }}</li>
                <li>{{ $t("help.bulletins.p4") }}</li>
              </ol>
              <p v-html="$t('help.advanced')"/>
            </div>
          </template>
        </div>
      </div>
  </div>
</template>

<script>
  const LAUNCHER_SCRIPT = window.location.protocol + "//" + window.location.host + "/widgets/v1/launcher.js";

  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
  import { faClone } from "@fortawesome/free-regular-svg-icons";

  import kirjastohakemisto from "../launcher";
  import ClipboardJS from "clipboard";

  export default {
    props: ["widgets"],
    data: () => ({
      output: "",
      customCss: null,
      options: {
        widget: null,
        lang: null,
        nosandbox: false,
      },
      widgetOptions: {},
      languageOptions: null,
      state: {
        customizeCss: false
      },
      faClone,
    }),
    created() {
      this.languageOptions = [
        { value: null, text: this.$t("- Automatic -") },
        { value: "fi", text: this.$t("Finnish") },
        { value: "en", text: this.$t("English") },
        { value: "sv", text: this.$t("Swedish") }
      ];

      this.options.widget = this.$route.path.substr(1) || null;
      this.updateCode();

      let clipboard = new ClipboardJS("button[data-copy-code]");
    },
    computed: {
      widget: {
        get: function() {
          return this.$route.path.substr(1) || null;
        },
        set: function(wid) {
          this.options.widget = wid;

          if (wid) {
            this.$router.push({ name: wid, params: {widget: wid} });
          } else {
            this.$router.push("/");
          }
        }
      },
      availableWidgets: function() {
        let options =  Object.keys(this.widgets).map((wid) => {
          return { value: wid, text: this.$t(this.widgets[wid].name) };
        });

        options.sort((a, b) => a.text.localeCompare(b.text));
        options.unshift({ value: null, text: this.$t("- Select widget -")});

        return options;
      },
    },
    methods: {
      updateCode() {
        function setAttribute(element, name, value) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              element.dataset[name] = value.join(" ");
            }
          } else if ([0, "", null, false, undefined].indexOf(value) == -1) {
            if (value === true) {
              value = "";
            }
            // element.setAttribute("data-" + name, value);
            element.dataset[name] = value;
          }
        };

        setTimeout(() => {
          if (!this.options.widget) {
            this.output = "";
            return;
          }

          let container = document.createElement("div");

          let script = document.createElement("script");
          script.src = LAUNCHER_SCRIPT;

          this.options.css = this.customCss ? `#css-${Math.ceil(Math.random() * 999)}` : undefined;

          Object.keys(this.options).forEach((key) => setAttribute(container, key, this.options[key]));
          Object.keys(this.widgetOptions).forEach((key) => setAttribute(container, key, this.widgetOptions[key]));

          const output = [container.outerHTML.replace(/=""/g, ""), script.outerHTML];

          if (this.customCss) {
            let style = document.createElement("script");
            style.type = "text/x-kirkanta-css";
            style.id = this.options.css.substr(1);
            style.innerText = this.customCss;

            output.push(style.outerHTML);
          }

          this.output = output.join("\n");
        }, 100);
      },
      onWidgetOptions(options) {
        this.widgetOptions = options;
        this.updateCode();
      },
      onSubmit(event) {
        event.preventDefault();
        this.updateCode();
      },
      acceptCustomCss() {
        this.state.customizeCss = false;
        this.updateCode();
      }
    },
    watch: {
      widget() {
        this.widgetOptions = {};
      },
      options: {
        handler() {
          this.updateCode();
        },
        deep: true
      },
      output() {
        setTimeout(() => {
          if (this.output) {
            kirjastohakemisto(document.querySelector("#preview [data-widget]"));
          }
        }, 100);
      }
    },
    components: { FontAwesomeIcon }
  };
</script>

<style lang="scss">
  @import "../../scss/builder/builder";

  @include media-breakpoint-up("lg") {
    #preview {
      max-height: 100%;
    }
  }

  #builder {
    flex-grow: 1;
    flex-direction: column;
    background-color: whitesmoke;

    $group-padding-x: spacing(3);
    $group-padding-y: spacing(3);

    > .row {
      flex-grow: 1;

      // Fixes an issue with 15px empty space at the right edge.
      margin-right: -30px;

      @include media-breakpoint-down("md") {
        // flex-direction: column;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      .options {
        flex-grow: 1;
        margin-top: $input-padding-y;
      }

      .options,
      #output {
        legend, label, input, textarea, button, select, summary, .section-label {
          font-size: 92%;
        }
      }
    }

    .details-group {
      $details-spacing-y: spacing(3) * 0.5;
      margin: 0 (-1 * $group-padding-x) $group-padding-y;

      details {
        padding: 0 $group-padding-x;
      }

      details[open] {
        background-color: rgba(0, 0, 0, 0.2);
        padding-bottom: $group-padding-y;
        margin-bottom: 1px;
      }

      summary {
        line-height: 2.5;
        padding: 0 $group-padding-x;
        margin-left: -$group-padding-x;
        margin-right: -$group-padding-x;
      }

      summary:focus {
        outline: none;
      }

      .form-group {
        margin-bottom: 0;
      }
    }

    legend {
      margin-left: spacing(3);
    }

    .form-group {
      padding-left: $group-padding-x;
      padding-right: $group-padding-x;

      legend {
        margin-left: 0 !important;
      }
    }

    .custom-control {
      display: block;
    }
  }

  #builder {
    display: flex;
    flex-direction: column;

    @include media-breakpoint-up("lg") {
      flex-direction: row;
    }
  }

  #factory {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    border-right: 1px solid darken($secondary, 15%);
    overflow-x: hidden;

    @include media-breakpoint-down("md") {
      border-bottom: 1px solid darken($secondary, 15%);
      z-index: $zindex-modal;
    }

    @include media-breakpoint-up("lg") {
      width: 100%;
      max-width: 18rem;
    }
  }

  #right-side {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    position: relative;
    background-color: $white;
  }

  #output {
    position: relative;
    box-shadow: 0 0 5px black;
    background-color: theme-color-level("warning", -10);

    summary {
      line-height: 3rem;
      padding-left: spacing(3);
      outline: none;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-width: 1px 0;
      // background-color: theme-color("warning");
    }

    button[data-copy-code] {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      border-radius: 15px;
      line-height: 1.4rem;
    }

    > div {
      padding: spacing(3);
    }

    @include media-breakpoint-up("lg") {
      order: 2;
      z-index: $zindex-modal;
    }
  }

  #output-value {
    display: block;
    // margin: $grid-gutter-width / 2;
  }

  #builder-guide {
    padding-top: $grid-gutter-width / 2;
  }

  #preview-container {
    max-height: 100%;
    position: relative;
    padding: 0;
    flex-grow: 1;

    .badge {
      // position: absolute;
      top: 5px;
      left: 4px;
      box-shadow: 0 0 15px theme-color("info");
      border-radius: 5px;
      background-color: rgba(23, 162, 184, .9) !important;
      position: sticky;
    }

    @include media-breakpoint-up("lg") {
      overflow-y: auto;

      .badge {
        width: 6rem;
        margin-left: -6rem;
        position: sticky;
        float: right;
      }
    }
  }

  #preview {
    max-height: 100%;
    overflow: auto;
    border: 5px solid white;
  }

  #select-widget {
    background-color: rgba(100, 100, 100, 0.3);
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    padding: spacing(3);
    margin-bottom: 0;
  }

  #custom-css-popup {
    background-color: rgba(0, 0, 0, 0.75);
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    padding: map-get($spacers, 3);
    z-index: $zindex-modal + 1;
    display: flex;
    flex-flow: column;
  }

  #custom-css {
    flex-grow: 1;
  }
</style>
