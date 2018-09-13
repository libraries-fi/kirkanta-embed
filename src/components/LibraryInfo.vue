<template>
  <article class="zxc zxc-library-info" :data-tabbed="tabbed ? '' : false" v-if="library">
    <div class="header">
      <button v-if="embedded" type="button" class="btn btn-link" @click="returnToList">Return to list</button>

      <h1>{{ library.name }}</h1>
    </div>

    <div class="content main">
      <div class="content-tab" id="tab-library" :data-active-tab="$route.name == 'library'">
        <blockquote class="slogan" v-if="library.slogan">
          <font-awesome-icon :icon="faQuote"/>
          {{ library.slogan }}
        </blockquote>

        <section class="row">
          <div class="col-md-2">
            <div v-if="library.cover" class="pt-md-3 pr-md-3">
              <img :src="library.cover.files.small" :alt="library.cover.name" class="cover-photo"/>
            </div>
          </div>

          <aside class="col-md-2" v-if="library.schedules">
            <h2 class="sr-only">Service hours</h2>
            <schedules :schedules="library.schedules" expandMode="none"/>
          </aside>
        </section>
        <section class="row">
          <h2 class="sr-only">Presentation</h2>
          <div class="row" v-if="library.description" v-html="library.description"/>
        </section>
      </div>

      <div class="content-tab" id="tab-contact" :data-active-tab="$route.name == 'contact'">
        <section v-if="library.address" class="row">
          <h2 class="sr-only">Contact details</h2>

          <div class="col-md-2">
            <address>
              <h3>Location</h3>
              <p>{{ library.address.street }}, {{ library.address.zipcode }} {{ library.address.city }} <span v-if="library.address.area">({{ library.address.area }})</span></p>
              <p v-if="library.address.info">{{ library.address.info }}</p>
            </address>
          </div>

          <div class="col-md-2">
            <div v-if="library.mailAddress">
              <h3>Mail Address</h3>
              <address>
                <div>{{ library.name }}</div>
                <div v-if="library.mailAddress.street">{{ library.mailAddress.street }}</div>
                <div v-if="library.mailAddress.box_number">P.O. Box {{ library.mailAddress.box_number}}</div>
                <div>{{ library.mailAddress.zipcode }} {{ library.mailAddress.area.toUpperCase() }}</div>
              </address>
            </div>
          </div>
        </section>

        <section v-if="library.transit">
          <h2 class="sr-only">Transit directions</h2>
          <h3>Public transportation</h3>

          <dl>
            <template v-if="library.transit.buses">
              <dt>Buses</dt>
              <dd>{{ library.transit.buses }}</dd>
            </template>
            <template v-if="library.transit.trams">
              <dt>Trams</dt>
              <dd>{{ library.transit.trams }}</dd>
            </template>
            <template v-if="library.transit.trains">
              <dt>Trains</dt>
              <dd>{{ library.transit.trains }}</dd>
            </template>
          </dl>

          <div v-if="library.transit.parking">
            <h3>Parking instructions</h3>
            {{ library.transit.parking }}
          </div>
        </section>
      </div>

      <div class="content-tab" id="tab-services" :data-active-tab="$route.name == 'services'">
        <section v-if="library.services">
          <services :services="library.services"/>
        </section>
      </div>
    </div>
  </article>
</template>

<script>
  import Library from "../entity/library";
  import apiCall from "../utils/api-call";
  import Services from "./Services.vue";
  import Schedules from "./Schedules.vue";

  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import faQuoteRight from "@fortawesome/fontawesome-free-solid/faQuoteRight";

  export default {
    props: ["id", "lang", "tabbed", "embedded"],
    data: () => ({
      library: null,
      activeTab: "library"
    }),
    computed: {
      faQuote: () => faQuoteRight,
    },
    async created() {
      let query = {
        id: this.id,
        limit: 1,
        with: "extra mail_address pictures schedules services",
        "period.start": "0w",
        "period.end": "4w",
      };

      let response = await apiCall("/library", this.lang, query);
      let library = response.data.items[0];

      if (library) {
        this.library = new Library(library);
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
    components: { FontAwesomeIcon, Services, Schedules }
  };
</script>

<style lang="scss">
  @import "../../scss/widget";
  
  .zxc-library-info {

    .slogan {
      margin-top: spacing(2);
    }

    .cover-photo {
      width: 100%;
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
