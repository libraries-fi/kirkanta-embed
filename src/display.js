import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Router from 'vue-router'
import LibraryInfo from './components/LibraryInfo.vue'

import fi from 'messages.fi.json'
import sv from 'messages.sv.json'
import routerConfig from './init.router'

Vue.use(Router)
Vue.use(VueI18n)

class LibraryDisplayWidget extends Vue {
  constructor (container, params) {
    let options = Object.assign({
      lang: null,
      library: null,
      tabbed: false,
      embedded: false,

      /*
       * Mode for expanding time entry rows.
       * current|all|none
       */
      expandMode: 'none'
    }, params)

    const i18n = new VueI18n({
      locale: options.lang,
      messages: { fi, sv }
    })

    let router = new Router(Object.assign(routerConfig, {
      routes: [
        {
          path: '/:id'.replace(/:id/, options.library),
          name: 'library',
          props: (route) => ({
            id: options.library,
            lang: options.lang
          }),
          children: [
            {
              path: 'contact',
              name: 'contact'
            },
            {
              path: 'services',
              name: 'services'
            }
          ]
        }
      ]
    }))

    router.replace({ name: 'library', params: { library: options.library } })

    super({
      el: container,
      template: '<library-info :id="library" :lang="lang" :tabbed="tabbed" :embedded="embedded" :expandMode="expandMode"/>',
      data: () => options,
      components: { LibraryInfo },
      router,
      i18n
    })
  }
}

window['kirjastot.fi.display'] = LibraryDisplayWidget
