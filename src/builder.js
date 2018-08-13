import Vue from "vue";
import Router from "vue-router";
import BootstrapVue from "bootstrap-vue";

import DisplayConfig from "./builder/DisplayConfig.vue";
import SchedulesConfig from "./builder/SchedulesConfig.vue";
import SearchConfig from "./builder/SearchConfig.vue";
import WidgetBuilder from "./builder/WidgetBuilder.vue";

import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(Router);
Vue.use(BootstrapVue);

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
    name: "Library Display",
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
    super({
      el: container,
      data: { widgets },
      template: '<widget-builder :widgets="widgets"/>',
      components: { WidgetBuilder },
      router,
    });
  }
}

document.querySelectorAll("#widget-builder").forEach((container) => {
  let builder = new Builder(container, {
    lang: "fi"
  });
});
