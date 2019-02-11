import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Router from 'vue-router'
import LibraryList from '@/components/LibraryList'
import LibraryInfo from '@/components/LibraryInfo'

import fi from 'messages.fi.json'
import sv from 'messages.sv.json'
import en from 'messages.en.json'

import routerConfig from '@/init.router'

Vue.use(Router)
Vue.use(VueI18n)

class SearchWidget extends Vue {
  constructor (container, params) {
    let search = {
      q: params.q,
      id: params.library,
      city: params.city,
      consortium: params.consortium,
      type: params.type
    }

    if (params.branch_type) {
      /**
       * Property 'type' was called 'branch_type' in old Kirkanta and hence
       * in widgets that used API v3 as well. Support this option so libraries
       * do not need to update their widget configurations by hand.
       */
      params.type = params.branch_type.replace(/\blibrary\b/, 'municipal')
    }

    let router = new Router(Object.assign(routerConfig, {
      routes: [
        {
          path: '/',
          name: 'search',
          component: LibraryList,
          props: (route) => ({
            form: search,
            lang: params.lang
          })
        },
        {
          path: '/:id',
          name: 'library',
          component: LibraryInfo,
          props: (route) => ({
            id: route.params.id,
            lang: params.lang,
            embedded: true,
            expandMode: params.expandMode || 'none',
            disable: params.disable
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

    const i18n = new VueI18n({
      locale: params.lang,
      messages: { fi, sv, en }
    })

    super({
      el: container,
      template: '<router-view @return-to-main="returnToSearch"/>',
      methods: {
        returnToSearch () {
          this.$router.push({ name: 'search' })
        }
      },
      router,
      i18n
    })
  }
}

window['kirjastot.fi.search'] = SearchWidget
