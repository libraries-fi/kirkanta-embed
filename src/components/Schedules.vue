<template>
  <div class="zxc zxc-weekly-schedules" :data-expand-mode="expandMode" v-if="schedules">
    <div class="toolbar" v-if="schedules.length">
      <button type="button" v-on:click="previousWeek" class="btn btn-link btn-sm">
        <font-awesome-icon :icon="faWeekPrev"/>
      </button>
      <h2 class="week-label h3">{{ $t('schedules.week') }} {{ week }}</h2>
      <button type="button" v-on:click="nextWeek" class="btn btn-link btn-sm">
        <font-awesome-icon :icon="faWeekNext"/>
      </button>
    </div>

    <table class="table table-sm table-borderless schedules" v-if="schedules.length">
      <thead class="sr-only">
        <tr>
          <th class="col-date">{{ $t('schedules.date') }}</th>
          <th class="col-weekday">{{ $t('schedules.day') }}</th>
          <th class="col-time">{{ $t('schedules.times') }}</th>
        </tr>
      </thead>

      <tbody v-for="(day, index) of schedules.slice(this.i * 7, (this.i + 1) * 7)" :class="isToday(day) ? 'current-day' : null" :data-expanded="index == expandedRow">
        <tr class="day-entry">
          <th :rowspan="day.times.length + 1 + (day.info ? 1 : 0)" scope="row" class="col-date">
            <date-time :date="day.date" format="P" formal short/>
          </th>
          <td class="col-weekday">
            <date-time :date="day.date" format="cccc"/>

            <button class="btn btn-link" @click="expandedRow = index" v-if="expandMode == 'current' && !day.closed">
              <font-awesome-icon :icon="faCollapse" v-if="index == expandedRow"/>
              <font-awesome-icon :icon="faExpand" v-else/>
            </button>
          </td>
          <td v-if="day.closed" class="col-time closed">{{ $t('schedules.closed') }}</td>
          <td v-else class="col-time">
            <date-time :time="day | opens" format="p" formal/>
            <date-time :time="day | closes" format="p" formal/>
          </td>
        </tr>
        <tr v-for="time of day.times" class="time-entry" :class="['closed', 'regular', 'self-service'][time.status]">
          <td v-if="time.status == 0" class="col-status">{{ $t('schedules.library-closed') }}</td>
          <td v-if="time.status == 1" class="col-status">{{ $t('schedules.staff-present') }}</td>
          <td v-if="time.status == 2" class="col-status">{{ $t('schedules.self-service') }}</td>

          <td class="col-time">
            <date-time :time="time.from" format="p"/>
            <date-time :time="time.to" format="p"/>
          </td>
        </tr>
        <tr v-if="day.info" class="day-info text-muted">
          <td colspan="2">{{ day.info }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>{{ $t('schedules.empty') }}</p>

    <div class="period-info" v-if="periodInfo.length">
      <template v-for="period of periodInfo">
        <p v-if="period.description">
          <b v-if="period.isException">
            <date-time :date="period.validFrom" format="P" formal short/> –
            <date-time :date="period.validUntil" format="P" formal short/>:
          </b>
          <b v-else>
            {{ $t('schedules.from') }} <date-time :date="period.validFrom" format="P" formal short/>:
          </b>
          <span>{{ period.description }}</span>
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import { format, isSameDay, toDate } from 'date-fns'
import { first, last } from '@/mixins'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAngleDoubleLeft, faAngleDoubleRight, faMinusSquare } from '@fortawesome/free-solid-svg-icons'
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons'

import DateTime from './DateTime'

export default {
  props: ['schedules', 'periods', 'expandMode'],
  data: () => ({
    i: 0,
    expandedRow: parseInt(format(new Date(), 'i')) - 1
  }),
  computed: {
    week () {
      if (this.schedules) {
        let day = this.schedules[this.i * 7]
        return day ? format(toDate(day.date), 'I') : null
      }
    },
    periodInfo () {
      let filtered = []
      for (let pid in this.periods) {
        if (this.periods[pid].description) {
          filtered.push(this.periods[pid])
        }
      }

      return filtered
    },
    faWeekPrev: () => faAngleDoubleLeft,
    faWeekNext: () => faAngleDoubleRight,
    faExpand: () => faPlusSquare,
    faCollapse: () => faMinusSquare
  },
  methods: {
    toggleDay (event) {
      event.expanded = true
    },
    previousWeek () {
      this.i = Math.max(this.i - 1, 0)
    },
    nextWeek () {
      this.i = Math.min(this.i + 1, (this.schedules.length / 7) - 1)
    },
    isToday (day) {
      return isSameDay(new Date(), toDate(day.date))
    }
  },
  filters: {
    opens (day) {
      return first(day.times).from
    },
    closes (day) {
      return last(day.times).to
    }
  },
  components: { DateTime, FontAwesomeIcon }
}
</script>

<style lang="scss">
  @import "../../scss/variables";

  .zxc-weekly-schedules {
    th[scope="row"] {
      font-weight: unset;
    }

    .toolbar {
      display: flex;

      button {
        color: unset;
      }

      h2 {
        line-height: 1.8;
      }
    }

    .week-label {
      text-align: center;
      flex-grow: 1;
      margin: 0;
    }

    .col-date {
      width: 1rem;
      white-space: nowrap;
      text-align: center;
    }

    .col-weekday {
      width: 300px;
      text-align: left;
    }

    .col-time {
      width: 1rem;
      white-space: nowrap;
      text-align: center;

      :last-child:before {
        content: " – ";
      }
    }

    .day-entry {
      .closed {
        text-transform: lowercase;
      }
    }

    .time-entry {
      color: $text-muted;
      font-size: smaller;

      &.closed {
        color: theme-color("danger");
      }
    }

    .day-entry + .time-entry {
      th, td {
        padding-top: 0;
      }
    }

    .current-day {
      background-color: theme-color("light");
      // border-top: 1px solid $border-light !important;
      // border-bottom: 1px solid $border-light !important;
    }

    .day-info {
      font-size: smaller;
    }

    .period-info {
      border-top: 3px dashed $table-border-color;
      padding: spacing(1);

      span {
        white-space: pre-line;
      }
    }

    &[data-expand-mode="current"] {
      .col-weekday button {
        padding: 0;
        line-height: inherit;
        float: right;
      }

      .day-entry {
        th, td {
          padding-top: $table-cell-padding;
          padding-bottom: $table-cell-padding;
        }
      }

      .time-entry {
        display: none;
      }

      tbody[data-expanded] {
        .time-entry {
          display: table-row;
        }
      }
    }

    &[data-expand-mode="none"] {
      .time-entry {
        display: none !important;
      }
    }

    &[data-expand-mode="all"] {

    }

    &[data-no-browse] {
      .toolbar,
      .col-date {
        display: none;
      }
    }
  }
</style>
