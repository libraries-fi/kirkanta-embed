<template>
  <article class="zxc zxc-library-info" :data-tabbed="tabbed ? '' : false">
    <button v-if="embedded" type="button" class="btn btn-link" @click="returnToList">Return to list</button>

    <h1 class="titlebar">{{ data.name }}</h1>

    <div class="toolbar" v-if="tabbed">
      <ul class="nav nav-pills">
        <li class="nav-item">
          <router-link :to="{name: 'library', params: {library}}" class="nav-link">Presentation</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name: 'contact', params: {library}}" class="nav-link">Contact</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name: 'services', params: {library}}" class="nav-link">Services</router-link>
        </li>
      </ul>
    </div>

    <div class="content">
      <div class="content-tab" id="tab-library" :data-active-tab="$route.name == 'library'">
        <blockquote v-if="data.slogan">
          <font-awesome-icon :icon="faQuote"/>
          {{ data.slogan }}
        </blockquote>

        <section>
          <h2>Presentation</h2>
          <div v-if="data.cover">
            <img :src="data.cover.files.small" :alt="data.cover.name"/>
          </div>
          <div v-if="data.description" v-html="data.description"/>
        </section>
      </div>

      <div class="content-tab" id="tab-contact" :data-active-tab="$route.name == 'contact'">
        <section v-if="data.address">
          <h2>Contact details</h2>
          <h3>Location</h3>

          <address>
            <p>{{ data.address.street }}, {{ data.address.zipcode }} {{ data.address.city }} <span v-if="data.address.area">({{ data.address.area }})</span></p>
            <p v-if="data.address.info">{{ data.address.info }}</p>
          </address>

          <div v-if="data.mailAddress">
            <h3>Mail Address</h3>
            <address>
              <div>{{ data.name }}</div>
              <div v-if="data.mailAddress.street">{{ data.mailAddress.street }}</div>
              <div v-if="data.mailAddress.box_number">P.O. Box {{ data.mailAddress.box_number}}</div>
              <div>{{ data.mailAddress.zipcode }} {{ data.mailAddress.area.toUpperCase() }}</div>
            </address>
          </div>
        </section>

        <section v-if="data.transit">
          <h2>Transit directions</h2>
          <h3>Public transportation</h3>

          <dl>
            <template v-if="data.transit.buses">
              <dt>Buses</dt>
              <dd>{{ data.transit.buses }}</dd>
            </template>
            <template v-if="data.transit.buses">
              <dt>Trams</dt>
              <dd>{{ data.transit.trams }}</dd>
            </template>
            <template v-if="data.transit.buses">
              <dt>Trains</dt>
              <dd>{{ data.transit.trains }}</dd>
            </template>
          </dl>

          <div v-if="data.transit.parking">
            <h3>Parking instructions</h3>
            {{ data.transit.parking }}
          </div>
        </section>
      </div>

      <div class="content-tab" id="tab-services" :data-active-tab="$route.name == 'services'">
        <section v-if="services">
          <h2>Services</h2>
          <template v-for="group of services">
            <h3>{{ group.title }}</h3>
            <ul>
              <li v-for="service of group.services">
                <span v-if="service.custom_name">{{ service.custom_name}}</span>
                <span v-else>{{ service.name }}</span>
              </li>
            </ul>
          </template>
        </section>
      </div>
    </div>
  </article>
</template>

<script>
  import Library from "../entity/library";
  import apiCall from "../utils/api-call";

  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import faQuoteRight from "@fortawesome/fontawesome-free-solid/faQuoteRight";

  export default {
    props: ["library", "lang", "tabbed", "embedded"],
    data: () => ({
      data: {},
      activeTab: "library"
    }),
    computed: {
      faQuote: () => faQuoteRight,
      services() {
        if (this.data.services) {
          let groups = {};

          for (let service of this.data.services) {
            if (!groups[service.type]) {
              groups[service.type] = {
                title: service.type,
                services: [service]
              };
            } else {
              groups[service.type].services.push(service);
            }
          }

          for (let gid of Object.keys(groups)) {
            groups[gid].services.sort((a, b) => {
              let va = a.custom_name || a.name;
              let vb = b.custom_name || b.name;

              return va.localeCompare(vb);
            });
          }

          return groups;
        }
      }
    },
    async created() {
      let query = {
        id: this.library,
        limit: 1,
        with: "extra mail_address pictures schedules services",
        "period.start": "0w",
        "period.end": "4w",
      };

      let response = await apiCall("/library", this.lang, query);
      let library = response.data.items[0];

      if (library) {
        this.data = new Library(library);
      } else {
        throw "Library '" + query.id + "' not found";
      }
    },
    methods: {
      returnToList: function() {
        this.$emit("return-to-main");
      }
    },
    watch: {
      $route(route) {
        console.log("ROUTE CHANGE", route);
      }
    },
    components: { FontAwesomeIcon }
  };
</script>

<style lang="scss">
  .zxc-library-info {
    @import "../../scss/widget";
    @import "~bootstrap/scss/nav";

    background-color: $body-bg;
    color: $body-color;


    blockquote {
      margin-top: map-get($spacers, 2);
    }

    &[data-tabbed] {
      .content-tab {
        display: none;
      }

      .content-tab[data-active-tab] {
        display: unset;
      }
    }
  }

</style>
