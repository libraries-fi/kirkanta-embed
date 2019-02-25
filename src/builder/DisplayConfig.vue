<template>
  <div class="custom-options">
    <div class="details-group">
      <b-form-group id="option-library">
        <details>
          <summary>{{ $t('builder.basic-settings') }}</summary>
          <label for="o-library">{{ $t('builder.library') }}</label>
          <auto-complete id="o-library" name="x-library" :value-key="'id'" :label-key="'name'" v-model="options.library" :suggestions="librarySuggestions" @input="onLibraryAutoComplete" required/>
        </details>
      </b-form-group>

      <b-form-group id="o-expand-mode">
        <details>
          <summary>{{ $t('schedules.title') }}</summary>
          <span class="section-label">{{ $t('schedules.expand.title') }}</span>
          <b-form-radio-group v-model="options.expandMode">
            <b-form-radio :value="null">{{ $t('schedules.expand.none') }}</b-form-radio>
            <b-form-radio value="current">{{ $t('schedules.expand.current-day') }}</b-form-radio>
            <b-form-radio value="all">{{ $t('schedules.expand.all') }}</b-form-radio>
          </b-form-radio-group>
        </details>
      </b-form-group>

      <b-form-group id="o-contact-info">
        <details>
          <summary>{{ $t('contact-info.section-title') }}</summary>
          <span class="section-label">{{ $t('contact-info.scope') }}</span>
          <b-form-radio-group v-model="options.disable">
            <b-form-radio :value="null">{{ $t('contact-info.show-all') }}</b-form-radio>
            <b-form-radio value="staff">{{ $t('contact-info.hide-staff') }}</b-form-radio>
          </b-form-radio-group>
        </details>
      </b-form-group>
    </div>
  </div>
</template>

<script>
import apiCall from '../mixins/api-call'
import AutoComplete from './AutoComplete.vue'

const AUTOCOMPLETE_LIMIT = 10

export default {
  data: () => ({
    librarySuggestions: [],
    options: {
      library: null,
      tabbed: false,
      disable: null
    }
  }),
  methods: {
    async onLibraryAutoComplete (name) {
      if (name.length >= 2) {
        let result = await apiCall('/library', 'fi', { q: name, sort: 'name', limit: AUTOCOMPLETE_LIMIT })
        this.librarySuggestions = result.data.items
      }
    }
  },
  watch: {
    options: {
      handler () {
        this.$emit('options', this.options)
      },
      deep: true
    }
  },
  components: { AutoComplete }
}
</script>
