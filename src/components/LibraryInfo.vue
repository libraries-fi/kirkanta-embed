<template>
  <article class="zxc zxc-library-info" :data-tabbed="tabbed ? '' : false" v-if="library">
    <div class="header">
      <button v-if="embedded" type="button" class="btn btn-link" @click="returnToList">Return to list</button>
      <h1>{{ library.name }}</h1>
    </div>

    <div class="content main">
      <div class="content-tab" id="tab-library" :data-active-tab="$route.name == 'library'">
        <blockquote class="slogan" v-if="library.slogan">
          <font-awesome-icon :icon="faQuoteRight"/>
          {{ library.slogan }}
        </blockquote>

        <section class="row">
          <div class="col-md-2 cover-photo-cell">
            <div v-if="library.cover" class="pr-md-3">
              <img :src="library.cover.files.small" :alt="library.cover.name" class="cover-photo"/>
            </div>
            <div v-else class="no-photo">
              <font-awesome-icon :icon="faImage" size="6x"/>
            </div>
          </div>
          <aside class="col-md-2" v-if="library.schedules">
            <h2 class="sr-only">Service hours</h2>
            <schedules :schedules="library.schedules" :expandMode="expandMode"/>
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
            <h3>Location</h3>
            <address>
              <p class="mb-1">
                {{ library.address.street }}, {{ library.address.zipcode }} {{ library.address.city }} <template v-if="library.address.area">({{ library.address.area }})</template><br/>
                <template v-if="library.address.info">{{ library.address.info }}</template>
              </p>

              <p v-if="library.email" class="mb-1">
                <b>Email</b><br/>
                <a :href="'mailto:' + library.email">{{ library.email }}</a><br/>
              </p>

              <p v-if="library.phone" class="mb-1">
                <b>{{ library.phone.name }}</b><br/>
                <a :href="'tel:+358' + library.phone.number.replace(/\D/g, '').substr(1)">{{ library.phone.number }}</a>
              </p>
            </address>
          </div>

          <div class="col-md-2">
            <div v-if="library.mailAddress">
              <h3>Mail Address</h3>
              <p>
                {{ library.name }}<br/>
                <template v-if="library.mailAddress.street">{{ library.mailAddress.street }}<br/></template>
                <template v-if="library.mailAddress.box_number">P.O. Box {{ library.mailAddress.box_number}}<br/></template>
                <template>{{ library.mailAddress.zipcode }} {{ library.mailAddress.area.toUpperCase() }}<br/></template>
              </p>
            </div>
          </div>
        </section>

        <div v-if="library.links" class="mb-3 resource-links">
          <h2 class="sr-only">Links to other websites</h2>
          <a v-for="link in sortedLinks" :href="link.url" class="mr-3 resource-link">
            <font-awesome-icon v-if="linkIcon(link)" :icon="linkIcon(link)"/>
            {{ link.name }}
          </a>
        </div>

        <section v-if="hasPublicTransportation()" class="mb-3">
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

      <section v-if="library.phoneNumbers" class="content-tab" id="tab-phones" :data-active-tab="$route.name == 'phones'">
        <h2>Phone numbers</h2>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Number</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="phone in library.phoneNumbers">
              <td>{{ phone.number }}</td>
              <td>{{ phone.name }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="library.services.length > 0" class="content-tab" id="tab-services" :data-active-tab="$route.name == 'services'">
        <services :services="library.services"/>
      </section>
    </div>
  </article>
</template>

<script>
  import Library from "../entity/library";
  import apiCall from "../utils/api-call";
  import Services from "./Services.vue";
  import Schedules from "./Schedules.vue";

  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
  import { faQuoteRight, faLink } from "@fortawesome/free-solid-svg-icons";
  import {
    faFacebookSquare,
    faFlickr,
    faInstagram,
    faPinterestSquare,
    faTwitterSquare,
    faVimeoSquare,
    faYoutube
  } from "@fortawesome/free-brands-svg-icons";

  import { faImage } from "@fortawesome/free-regular-svg-icons";

  const icon_map = new Map([
    [/facebook\.com/, faFacebookSquare],
    [/flickr\.com/, faFlickr],
    [/instagram\.com/, faInstagram],
    [/pinterest\.com/, faPinterestSquare],
    [/vimeo\.com/, faVimeoSquare],
    [/twitter\.com/, faTwitterSquare],
    [/youtube\.com/, faYoutube],
  ]);

  export default {
    props: ["id", "lang", "tabbed", "embedded", "expandMode"],
    components: { FontAwesomeIcon, Services, Schedules },
    data: () => ({
      library: null,
      activeTab: "library",
      faQuoteRight,
      faImage,
    }),
    computed: {
      sortedLinks() {
        if (this.library.links) {
          return this.library.links.sort((a, b) => {
            // NOTE: Horribly inefficient but whatever...

            let a_match = 0;
            let b_match = 0;

            for (let rx of icon_map.keys()) {
              if (a.url.match(rx)) {
                a_match = 1;
              }

              if (b.url.match(rx)) {
                b_match = 1;
              }
            }

            return a_match - b_match;
          });
        } else {
          return null;
        }
      }
    },
    async mounted() {
      let query = {
        id: this.id,
        limit: 1,
        with: "extra links mail_address pictures phone_numbers schedules services",
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
      },
      hasPublicTransportation: function() {
        if (this.library.transit) {
          for (let [field, info] of Object.entries(this.library.transit)) {
            if (info && info.length) {
              return true;
            }
          }
        }
        return false;
      },
      linkIcon: function(link) {
        let icon_class = faLink;

        for (let [rx, icon] of icon_map) {
          if (link.url.match(rx)) {
            icon_class = icon;
          }
        }

        return icon_class;
      },
    }
  };
</script>

<style lang="scss">
  @import "../../scss/variables";

  .zxc-library-info {
    .cover-photo-cell {
      display: flex;
      flex-flow: column;
      justify-content: center;
    }

    .no-photo {
      text-align: center;
      color: #ddd;
    }

    .cover-photo {
      width: 100%;
    }

    .content-tab {
      margin-bottom: spacing(3);
    }

    .resource-link {
      display: inline-block;
      line-height: 2;
    }

    &[data-tabbed] {
      .content-tab {
        display: none;
      }

      .content-tab[data-active-tab] {
        display: initial;
      }
    }

    .fa-facebook-square {
      color: #3b5998;
    }

    .fa-twitter-square {
      color: #1da1f2;
    }

    .fa-instagram {
      background-color: #904ac6;
      color: white;
      padding: 0 1px;
      box-sizing: content-box;
    }

    .fa-pinterest-square {
      color: #d63633;
    }

    .fa-youtube {
      color: red;
    }

    .fa-vimeo {
      color: #1ab7ea;
    }

    .fa-flickr {
      color: #e62683;
    }

    .fa-link {
      color: #444;
    }
  }

</style>
