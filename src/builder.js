import Vue from "vue";
import VueI18n from "vue-i18n";
import Router from "vue-router";
import BootstrapVue from "bootstrap-vue";

import DisplayConfig from "./builder/DisplayConfig.vue";
import SchedulesConfig from "./builder/SchedulesConfig.vue";
import SearchConfig from "./builder/SearchConfig.vue";
import WidgetBuilder from "./builder/WidgetBuilder.vue";

import fi from "builder.fi.json";
import sv from "builder.sv.json";
import en from "builder.en.json";

import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(Router);
Vue.use(BootstrapVue);
Vue.use(VueI18n);

/*
 * NOTE: Labels are being translated when the dropdown menu is initialized.
 */
const widgets = {
  schedules: {
    name: "Schedules",
    form: SchedulesConfig,
  },
  search: {
    name: "Library Search",
    form: SearchConfig,
  },
  display: {
    name: "Library Introduction",
    form: DisplayConfig,
  }
};

const routes = [
  {
    name: "builder",
    path: "/",
    component: null
  },
];

Object.keys(widgets).forEach((wid) => {
  routes.push({
    name: wid,
    path: "/" + wid,
    component: widgets[wid].form
  });
});

const router = new Router({routes});

class Builder extends Vue {
  constructor(container, params) {
    const i18n = new VueI18n({
      locale: params.lang,
      messages: { fi, sv, en },
    });

    super({
      el: container,
      data: { widgets },
      template: '<widget-builder :widgets="widgets"/>',
      components: { WidgetBuilder },
      router,
      i18n
    });
  }
}

document.querySelectorAll("#widget-builder").forEach((container) => {
  console.log(document.documentElement.lang);
  let builder = new Builder(container, {
    lang: document.documentElement.lang
  });
});
