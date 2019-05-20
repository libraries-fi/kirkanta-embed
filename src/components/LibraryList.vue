<template>
  <div class="zxc zxc-library-list" data-busy>
    <div class="header">
      <h1>{{ $t('library.search.title') }}</h1>

      <form @submit.prevent="onSubmit">
        <input type="hidden" name="id" :value="form.library"/>
        <input type="hidden" name="city" :value="form.city"/>
        <input type="hidden" name="type" :value="form.type"/>

        <div class="input-group">
          <input type="search" class="form-control form-control-lg" name="q" :placeholder="$t('library.search.placeholder') " v-model="form.q" @input="trySubmit"/>
          <div class="input-group-append">
            <div class="throbber"></div>
            <button type="submit" class="btn btn-primary">
              <font-awesome-icon :icon="faSearch"/>
            </button>
          </div>
        </div>
      </form>
    </div>

    <ol v-if="result.length" class="list-unstyled row">
      <li v-for="library of result" class="col-md-2">
        <div class="library-card">
          <div class="icon">
            <img v-if="library.coverPhoto" :src="library.coverPhoto.small.url" alt=""/>
          </div>
          <div class="info">
            <a :href="`${$t('base-url')}/${library.slug}`" @click="onClickLibrary" :data-id="library.id">{{ library.name }}</a>
            <p v-if="library.address">
              {{ library.address.street }},
              {{ library.address.area || library.address.city }}
            </p>
          </div>
        </div>
      </li>
    </ol>

    <div class="load-more-container" v-if="canLoadMore">
      <button type="button" class="btn btn-link btn-lg" @click="loadMore">{{ $t('library.search.load-more')}}</button>
    </div>
  </div>
</template>

<script>
import apiCall from '../mixins/api-call'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export default {
  props: ['lang', 'form', 'paging'],
  components: { FontAwesomeIcon },
  data: () => ({
    result: [],
    pageNumber: 0,
    canLoadMore: true,
    timers: {
      submit: null
    },
    faSearch
  }),
  computed: {
    busy: {
      get () {
        return this.$el.hasAttribute('data-busy')
      },
      set (state) {
        if (this.$el) {
          if (state) {
            this.$el.setAttribute('data-busy', '')
          } else {
            this.$el.removeAttribute('data-busy')
          }
        }
      }
    }
  },
  mounted (...foo) {
    this.onSubmit()
  },
  methods: {
    trySubmit (event) {
      if (this.timers.submit) {
        clearTimeout(this.timers.submit)
        this.timers.submit = 0
      }

      this.timers.submit = setTimeout(this.onSubmit, 500)
    },
    onClickLibrary (event) {
      event.preventDefault()
      this.$router.push({ name: 'library', params: { id: event.target.dataset.id } })
    },
    async onSubmit (append = false) {
      this.busy = true

      // Revert to a sane fallback value in case the librarians misconfigure their widgets.
      const pageSize = this.paging ? 20 : 100

      if (!append) {
        this.pageNumber = 0
      }

      let query = {
        sort: 'name',
        with: 'schedules',
        'period.start': '0d',
        'period.end': '1d',
        skip: this.pageNumber * pageSize,
        limit: pageSize
      }

      Object.assign(query, this.form)

      let response = await apiCall('/library', this.lang, query)

      if (append) {
        this.result.push(...response.data.items)
      } else {
        this.result = response.data.items
      }

      this.canLoadMore = response.data.items.length === pageSize
      this.busy = false
    },
    loadMore () {
      this.pageNumber++
      this.onSubmit(true)
    }
  }
}
</script>

<style lang="scss">
@import "../../scss/variables";

.zxc-library-list {
  // Negative margins cause the iframe sandbox to show a scroll bar.
  overflow-x: hidden;

  input[type="search"] {
    flex-grow: 1;
  }

  .throbber {
    width: 2rem;
    background-color: blue;
    margin-left: -2rem - spacing(2);
    margin-right: spacing(2);
    display: none;
  }

  .search-results {
    margin-left: -1 * spacing(1);
    margin-right: -1 * spacing(1);
  }

  .library-card {
    height: 4rem;
    border: 1px solid #ccc;
    display: flex;
    overflow: hidden;
    // margin: spacing(1);
    margin-bottom: $grid-gutter-width / 2;

    .icon {
      width: 100px;
      flex: 0 0 100px;
      background-color: #eee;
      flex-direction: column;
      display: flex;
      overflow: hidden;

      .icon-bg {
      }

      img {
        width: calc(100% + 40px);
        height: auto;
      }
    }

    .info {
      padding-left: spacing(2);
      padding-right: spacing(2);
      flex: 1 0 100%;

      a {
        // font-size: larger;
        line-height: 2.5;
      }
    }
  }

  .load-more-container {
    display: flex;
    justify-content: space-around;
  }
}

.zxc-library-list[data-busy] {
  .throbber {
    display: unset;
  }
}
</style>
