<template>
  <article v-if="library" class="zxc zxc-library-info">
    <div class="header">
      <button v-if="embedded" type="button" class="btn btn-link" @click="returnToList">
        <font-awesome-icon :icon="faLongArrowAltLeft"/>
        {{ $t('library.return-to-list') }}
      </button>
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
            <div v-if="library.coverPhoto" class="cover-photo-frame">
              <img :src="library.coverPhoto.medium.url" alt="" class="cover-photo"/>
            </div>
            <div v-else class="no-photo">
              <font-awesome-icon :icon="faImage" size="6x"/>
            </div>
          </div>
          <aside class="col-md-2" v-if="library.schedules">
            <h2 class="sr-only">{{ $t('schedules.service-hours') }}</h2>
            <schedules :schedules="library.schedules" :expandMode="expandMode"/>
          </aside>
        </section>

        <section class="row">
          <h2 class="sr-only">{{ $t('library.introduction') }}</h2>
          <div v-if="library.description" v-html="library.description"/>
        </section>

        <div v-if="library.links" class="info-links">
          <h2 class="sr-only">{{ $t('library.remote-links') }}</h2>
          <a v-for="link in sortedLinks" :href="link.url" class="info-link">
            <font-awesome-icon v-if="linkIcon(link)" :icon="linkIcon(link)"/>
            {{ link.name }}
          </a>
        </div>
      </div>

      <div class="content-tab" id="tab-contact" :data-active-tab="$route.name == 'contact'">
        <section v-if="library.address" class="row">
          <h2 class="sr-only">{{ $t('library.contact-details') }}</h2>

          <div class="col-md-2">
            <h3>{{ $t('library.location') }}</h3>
            <address>
              <p>
                {{ library.address.street }}, {{ library.address.zipcode }} {{ library.address.city }} <template v-if="library.address.area">({{ library.address.area }})</template><br/>
                <template v-if="library.address.info">{{ library.address.info }}</template>
              </p>

              <p v-if="library.email">
                <b>{{ $t('library.email') }}</b><br/>
                <a :href="'mailto:' + library.email">{{ library.email }}</a><br/>
              </p>

              <p v-if="library.phone">
                <b>{{ library.phone.name }}</b><br/>
                <a :href="'tel:+358' + library.phone.number.replace(/\D/g, '').substr(1)">{{ library.phone.number }}</a>
              </p>
            </address>
          </div>

          <div class="col-md-2">
            <div v-if="library.mailAddress">
              <h3>{{ $t('library.mail-address') }}</h3>
              <p>
                {{ library.name }}<br/>
                <template v-if="library.mailAddress.street">{{ library.mailAddress.street }}<br/></template>
                <template v-if="library.mailAddress.boxNumber">{{ $t('library.po-box') }} {{ library.mailAddress.boxNumber}}<br/></template>
                <template>{{ library.mailAddress.zipcode }} {{ library.mailAddress.area.toUpperCase() }}<br/></template>
              </p>
            </div>
          </div>
        </section>

        <section v-if="hasPublicTransportation()">
          <h2 class="sr-only">{{ $t('library.transit-directions') }}</h2>
          <h3>{{ $t('library.public-transportation') }}</h3>

          <div class="row">
            <div v-if="library.transit.buses" class="col-md-2">
              <h4>{{ $t('library.buses') }}</h4>
              <p>{{ library.transit.buses }}</p>
            </div>
            <div v-if="library.transit.trams" class="col-md-2">
              <h4>{{ $t('library.trams') }}</h4>
              <p>{{ library.transit.trams }}</p>
            </div>
            <div v-if="library.transit.trains" class="col-md-2">
              <h4>{{ $t('library.train') }}</h4>
              <p>{{ library.transit.trains }}</p>
            </div>
          </div>

          <div v-if="library.transit.parking">
            <h3>{{ $t('library.parking') }}</h3>
            {{ library.transit.parking }}
          </div>
        </section>
      </div>

      <section v-if="hasContactInfo()" class="visual-section">
        <h2>
          <font-awesome-icon :icon="faAddressCard"/>
          {{ $t('contact-info.contact-details')}}
        </h2>
        <contact-info :library="library"/>
      </section>

      <section v-if="library.services.length" class="content-tab" id="tab-services" :data-active-tab="$route.name == 'services'">
        <h2>
          <font-awesome-icon :icon="faLuggageCart"/>
          {{ $t('services.title') }}
        </h2>
        <services :services="library.services"/>
      </section>
    </div>
  </article>
</template>

<script>
import apiCall from '../mixins/api-call'
import Services from './Services'
import Schedules from './Schedules'
import ContactInfo from './ContactInfo'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAddressCard, faLink, faLongArrowAltLeft, faLuggageCart, faQuoteRight } from '@fortawesome/free-solid-svg-icons'

import {
  faFacebookSquare,
  faFlickr,
  faInstagram,
  faPinterestSquare,
  faTwitterSquare,
  faVimeoSquare,
  faYoutube
} from '@fortawesome/free-brands-svg-icons'

import { faImage } from '@fortawesome/free-regular-svg-icons'

const iconMap = new Map([
  [/facebook\.com/, faFacebookSquare],
  [/flickr\.com/, faFlickr],
  [/instagram\.com/, faInstagram],
  [/pinterest\.com/, faPinterestSquare],
  [/vimeo\.com/, faVimeoSquare],
  [/twitter\.com/, faTwitterSquare],
  [/youtube\.com/, faYoutube]
])

export default {
  props: {
    id: { type: String, default: null },
    lang: { type: String, default: null },
    embedded: { type: Boolean, default: false },
    expandMode: { type: String, default: 'none' },
    disable: { type: String, default: '' }
  },
  components: { ContactInfo, FontAwesomeIcon, Services, Schedules },
  data: () => ({
    library: null,
    activeTab: 'library',
    faAddressCard,
    faImage,
    faLongArrowAltLeft,
    faLuggageCart,
    faQuoteRight
  }),
  computed: {
    disabledSections () {
      return this.disable.split(/\s+/)
    },
    sortedLinks () {
      if (this.library.links) {
        return this.library.links.sort((a, b) => {
          // NOTE: Horribly inefficient but whatever...

          let aMatch = 0
          let bMatch = 0

          for (let rx of iconMap.keys()) {
            if (a.url.match(rx)) {
              aMatch = 1
            }

            if (b.url.match(rx)) {
              bMatch = 1
            }
          }

          return aMatch - bMatch
        })
      } else {
        return null
      }
    }
  },
  async mounted () {
    let query = {
      with: ['departments', 'emailAddresses', 'links', 'mailAddress', 'pictures', 'phoneNumbers', 'schedules', 'services', 'transitInfo'],
      'period.start': '0w',
      'period.end': '4w'
    }

    if (this.disabledSections.indexOf('staff') === -1) {
      query.with.push('persons')
    }

    let response = await apiCall(`/library/${this.id}`, this.lang, query)
    this.library = response.data.data
  },
  methods: {
    returnToList () {
      this.$emit('return-to-main')
    },
    hasPublicTransportation () {
      if (this.library.transit) {
        for (let info of Object.values(this.library.transit)) {
          if (info && info.length) {
            return true
          }
        }
      }
      return false
    },
    hasContactInfo () {
      let persons = this.library.persons || []
      return (this.library.links.length + this.library.emailAddresses.length + this.library.phoneNumbers.length + persons.length) > 0
    },
    linkIcon (link) {
      let iconClass = faLink

      for (let [rx, icon] of iconMap) {
        if (link.url.match(rx)) {
          iconClass = icon
        }
      }

      return iconClass
    }
  }
}
</script>

<style lang="scss">
  @import "../../scss/variables";

  .zxc-library-info {
    .cover-photo-cell {
      display: flex;
      flex-flow: column;
      justify-content: center;
    }

    .cover-photo-frame {
      margin-bottom: spacing(3);
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

    .info-link {
      margin-right: spacing(3);
      display: inline-block;
      line-height: 2;
    }
  }

</style>
