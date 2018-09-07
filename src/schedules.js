import Vue from "vue";
import VueI18n from "vue-i18n";

import Schedules from "./components/Schedules.vue";
import Library from "./entity/library";
import apiCall from "./utils/api-call";

Vue.use(VueI18n);

const i18n = new VueI18n;

/**
 * Options:
 *    expandMode: NULL|all|none
 */
class SchedulesWidget extends Vue {
  constructor(container, params) {
    const options = Object.assign({

      /*
       * Target library ID
       */
      library: null,

      /*
       * Language for queries
       */
      lang: null,

      /*
       * Mode for expanding time entry rows.
       * current|all|none
       */
      expandMode: "current",

    }, params);

    super({
      el: container,
      template: `
        <div class="zxc-weekly-schedules" v-if="library">
          <h1>{{ library.name }}</h1>
          <schedules :schedules="schedules" :periods="periods" :expandMode="options.expandMode"/>
        </div>
      `,
      data: () => ({
        options,
        library: null,
        schedules: null,
        periods: null
      }),
      async mounted() {
        let query = {
          id: options.library,
          with: "schedules",
          refs: "period",
          "period.start": "0w",
          "period.end": "8w",
          limit: 1,
        };

        let response = await apiCall("/library", options.lang, query);
        let library = new Library(response.data.items[0], response.data.references);
        this.library = library;
        this.schedules = this.library.schedules;
        this.periods = response.data.references.period;
      },
      components: { Schedules },
      i18n,
    });
  }
}

window["kirjastot.fi.schedules"] = SchedulesWidget;
