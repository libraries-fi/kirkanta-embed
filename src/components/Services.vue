<template>
  <div @click="popupClose" class="row services-list">
    <h2 class="sr-only">{{ $t('services.title') }}</h2>

    <div class="col-md-2" v-for="column of columns">
      <div class="services-list-group" v-for="group of column">
        <h3>{{ group.title }}</h3>
        <ul class="services-list-item">
          <li v-for="(service, i) of group.services">
            <span v-if="service.description" class="link text-primary" v-b-popover:services-list.click.blur.top="popup(service)">
              {{ service.name || service.standardName }}
            </span>
            <span v-else>
              {{ service.name || service.standardName }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import Popper from 'popper.js'
  import bPopover from 'bootstrap-vue/es/directives/popover/popover'

  export default {
    props: ['services'],
    directives: {
      bPopover
    },
    data: () => ({
      expandedService: null,
      activePopups: []
    }),
    computed: {
      columns () {
        try {
          let sorted = this.groups

          let left = [sorted[0]]
          let right = sorted.slice(1)

          function itemCount (section) {
            return section.reduce((acc, g) => acc + g.services.length, 0)
          }

          while (itemCount(left) < itemCount(right) - 5) {
            if (right.length <= 2) {
              break
            }
            left.push(right.pop())
          }

          return [left, right]
        } catch (e) {
          // Will throw if services is empty -> just ignore.
          console.error(e)
        }
      },
      groups () {
        if (!this.services || this.services.length == 0) {
          throw 'No services data'
        }

        const groups = {}

        for (let [i, service] of this.services.entries()) {
          if (!groups[service.type]) {
            groups[service.type] = {
              title: this.$t(`services.type.${service.type}`),
              services: [service]
            }
          } else {
            groups[service.type].services.push(service)
          }
        }

        for (let gid of Object.keys(groups)) {
          groups[gid].services.sort((a, b) => {
            let va = a.name || a.standardName
            let vb = b.name || b.standardName

            // Aside from Russian this is safe here, but we don't need to support Russian in widgets.
            return va.localeCompare(vb, 'fi')
          })
        }

        return Object.values(groups).sort((a, b) => b.services.length - a.services.length)
      }
    },
    methods: {
      popupClose (event) {
        let closables = this.activePopups.filter((id) => id != event.target.id)

        for (let id of closables) {
          this.$root.$emit('bv::hide::popover', id)
        }
      },
      popup (service) {
        return {
          title: service.name || service.standardName,
          content: service.description,
          container: this.$el,
          show (event) {
            console.log(event)
          }
        }
      }
    },
    created () {
      this.$root.$on('bv::popover::show', (event) => {
        if (!event.target.id) {
          let id = Math.ceil(Math.random() * 999999)
          event.target.id = `popup-toggle-${id}`
        }
        this.activePopups.push(event.target.id)

        let close = document.createElement('button')
        close.type = 'button'
        close.className = 'close'
        close.setAttribute('aria-label', 'Close')
        close.innerHTML = '<span aria-hidden="true">&times;</span>'

        event.relatedTarget.querySelector('.popover-header').appendChild(close)

        close.addEventListener('click', () => {
          // NOTE: Using 'event' from containing function.
          this.$root.$emit('bv::hide::popover', event.target.id)
        })
      })
    }
  }
</script>

<style lang="scss">
  @import "../../scss/bootstrap/popover";

  .link {
    cursor: pointer;
  }

  .popover-body {
    white-space: pre-line;
  }

  .close {
    margin-left: spacing(2);
  }
</style>
