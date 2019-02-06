import Vue from "vue";
import VueI18n from "vue-i18n";
import Schedules from "./components/Schedules.vue";
import Library from "./entity/library";
import apiCall from "./mixins/api-call";

import fi from "messages.fi.json";
import sv from "messages.sv.json";

Vue.use(VueI18n);

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
      expandMode: "none",

    }, params);

    const i18n = new VueI18n({
      locale: options.lang,
      messages: { fi, sv },
    });

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
        let library = new Library(response.data.items[0], response.data.refs);
        this.library = library;
        this.schedules = this.library.schedules;
        this.periods = response.data.refs.period;
      },
      components: { Schedules },
      i18n,
    });
  }
}

window["kirjastot.fi.schedules"] = SchedulesWidget;
