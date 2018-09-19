import Vue from "vue";
import VueI18n from "vue-i18n";
import Router from "vue-router";
import LibraryList from "./components/LibraryList.vue";
import LibraryInfo from "./components/LibraryInfo.vue";

import fi from "messages.fi.json";
import sv from "messages.sv.json";
import routerConfig from "./init.router";

Vue.use(Router);
Vue.use(VueI18n);

class SearchWidget extends Vue {
  constructor(container, params) {
    let search = {
      q: params.q,
      id: params.library,
      city: params.city,
      consortium: params.consortium,
      type: params.type,
      branch_type: params.branch_type,
    };

    let router = new Router(Object.assign(routerConfig, {
      routes: [
        {
          path: "/",
          name: "search",
          component: LibraryList,
          props: (route) => ({
            form: search,
            lang: params.lang,
          })
        },
        {
          path: "/:id",
          name: "library",
          component: LibraryInfo,
          props: (route) => ({
            id: route.params.id,
            lang: params.lang,
            tabbed: params.tabbed,
            embedded: true,
            expandMode: params.expandMode || "none"
          }),
          children: [
            {
              path: "contact",
              name: "contact",
            },
            {
              path: "services",
              name: "services",
            }
          ]
        },
      ]
    }));

    const i18n = new VueI18n({
      locale: params.lang,
      messages: { fi, sv },
    });

    super({
      el: container,
      template: '<router-view @return-to-main="returnToSearch"/>',
      methods: {
        returnToSearch() {
          this.$router.push({name: "search"});
        }
      },
      router,
      i18n
    });

    // router.push({name: "library", params: {id: 84787, lang: "fi"}});
  }
}

window["kirjastot.fi.search"] = SearchWidget;
