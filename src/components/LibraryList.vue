<template>
  <div class="zxc zxc-library-list" data-busy>
    <h1 class="titlebar">Library Search</h1>

    <form @submit="onSubmit">
      <input type="hidden" name="id" :value="form.library"/>
      <input type="hidden" name="city" :value="form.city"/>
      <input type="hidden" name="type" :value="form.type"/>
      <input type="hidden" name="branch_type" :value="form.branch_type"/>

      <div class="search-box d-flex my-2">
        <input type="search" class="form-control-lg" name="q" placeholder="Search by name or municipality" v-model="form.q"/>
        <div class="throbber"></div>
        <button type="submit">
          <font-awesome-icon :icon="faSearch"/>
        </button>
      </div>
    </form>

    <ol v-if="result.length" class="list-unstyled search-results row">
      <li v-for="library of result" class="col-md-2">
        <div class="library-card">
          <div class="icon">
            <!-- <font-awesome-icon :icon="faImage" size="4x"/> -->
            <img v-if="library.cover" :src="library.cover.files.small" alt=""/>
          </div>
          <div class="info px-2">
            <a :href="'https://beta-hakemisto.kirjastot.fi/' + library.slug" @click="onClickLibrary" :data-id="library.id">{{ library.name }}</a>
            <p v-if="library.address">
              {{ library.address.street }},
              {{ library.address.area || library.address.city }}
            </p>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script>
  import queryString from "query-string";

  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import faImage from "@fortawesome/fontawesome-free-solid/faImage";
  import faSearch from "@fortawesome/fontawesome-free-solid/faSearch";

  import Library from "../entity/library";
  import Collection from "../utils/collection";
  import apiCall from "../utils/api-call";

  export default {
    props: ["lang", "form"],
    data: () => ({
      result: [],
    }),
    created(...foo) {
      this.submit();
    },
    methods: {
      onSubmit: function(event) {
        event.preventDefault();
        this.submit();
      },
      onClickLibrary: function(event) {
        event.preventDefault();
        this.$router.push({name: "library", params: {library: event.target.dataset.id}});
      },
      submit: async function() {
        this.busy = true;

        let query = {
          sort: "name",
          with: "pictures schedules",
          "period.start": "0d",
          "period.end": "1d",
        };

        Object.assign(query, this.form);

        let response = await apiCall("/library", this.lang, query);

        this.result = [...new Collection(Library, response.data.items)];
        this.busy = false;
      }
    },
    computed: {
      faImage: () => faImage,
      faSearch: () => faSearch,
      busy: {
        get: function() {
          return this.$el.hasAttribute("data-busy");
        },
        set: function(state) {
          if (this.$el) {
            if (state) {
              this.$el.setAttribute("data-busy", "");
            } else {
              this.$el.removeAttribute("data-busy");
            }
          }
        }
      }
    },
    components: { FontAwesomeIcon }
  };
</script>

<style lang="scss">
  @import "../../scss/widget";

  .zxc-library-list {

    background-color: $body-bg;
    color: $body-color;

    // Negative margins cause the iframe sandbox to show a scroll bar.
    overflow-x: hidden;

    input[type="search"] {
      flex-grow: 1;
    }

    .throbber {
      @extend .mr-2;

      width: 2rem;
      background-color: blue;
      margin-left: -2rem - spacing(2);
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
      margin: spacing(1);

      .icon {
        width: 120px;
        flex: 0 0 120px;
        background-color: #eee;
        flex-direction: column;
        display: flex;

        .icon-bg {
        }

        img {
          width: 100%;
          height: auto;
        }
      }

      .info {
        flex: 1 0 100%;

        a {
          font-size: larger;
          line-height: 2;
        }
      }
    }
  }

  .zxc-library-list[data-busy] {
    .throbber {
      display: unset;
    }
  }
</style>
