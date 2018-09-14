<template>
  <div class="zxc zxc-weekly-schedules" :data-expand-mode="expandMode" v-if="schedules">
    <div class="toolbar d-flex">
      <button type="button" v-on:click="previousWeek" class="btn btn-link btn-sm">
        <font-awesome-icon :icon="faWeekPrev"/>
      </button>
      <h2 class="week-label h3 text-center m-0">Week {{ week }}</h2>
      <button type="button" v-on:click="nextWeek" class="btn btn-link btn-sm">
        <font-awesome-icon :icon="faWeekNext"/>
      </button>
    </div>

    <table class="table table-sm table-borderless schedules">
      <thead class="sr-only">
        <tr>
          <th class="col-date">Date</th>
          <th class="col-weekday">Day</th>
          <th class="col-time">Times</th>
        </tr>
      </thead>

      <tbody v-for="(day, index) of schedules.slice(this.i * 7, (this.i + 1) * 7)" :class="parseInt(day.live_status) ? 'current-day' : null" :data-expanded="index == expandedRow">
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
          <td v-if="day.closed" class="col-time closed">Closed</td>
          <td v-else class="col-time">
            <date-time :time="day.opens" format="p" formal/>
            <date-time :time="day.closes" format="p" formal/>
          </td>
        </tr>
        <tr v-for="time of day.times" class="time-entry" :class="['closed', 'regular', 'self-service'][time.status]">
          <td v-if="time.status == 0" class="col-status">Library closed</td>
          <td v-if="time.status == 1" class="col-status">Staff present</td>
          <td v-if="time.status == 2" class="col-status">Self-service</td>

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

    <div class="period-info p-1" v-if="periodInfo.length">
      <template v-for="period of periodInfo">
        <p v-if="period.description">
          <b v-if="period.valid_until">
            <date-time :date="period.valid_from" format="P" formal short/> –
            <date-time :date="period.valid_until" format="P" formal short/>:
          </b>
          <b v-else>
            From <date-time :date="period.valid_from" format="P" formal short/>:
          </b>
          <span>{{ period.description }}</span>
        </p>
      </template>
    </div>
  </div>
</template>

<script>
  import format from "date-fns/format";
  import toDate from "date-fns/toDate";

  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
  import { faAngleDoubleLeft, faAngleDoubleRight, faArrowCircleDown, faMinusSquare } from "@fortawesome/free-solid-svg-icons";
  import { faArrowAltCircleRight, faPlusSquare } from "@fortawesome/free-regular-svg-icons";

  // import { faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons/faAngleDoubleLeft";
  // import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons/faAngleDoubleRight";
  // import { faArrowCircleDown } from "@fortawesome/free-solid-svg-icons/faArrowCircleDown";
  // import { faMinusSquare } from "@fortawesome/free-solid-svg-icons/faMinusSquare";
  //
  // import { faArrowAltCircleRight } from "@fortawesome/free-regular-svg-icons/faArrowAltCircleRight";
  // import { faPlusSquare } from "@fortawesome/free-regular-svg-icons/faPlusSquare";

  import DateTime from "./DateTime.vue";

  export default {
    props: ["schedules", "periods", "expandMode"],
    data: () => ({
      i: 0,
      expandedRow: parseInt(format(new Date, "i")) - 1,
    }),
    computed: {
      week() {
        if (this.schedules) {
          let day = this.schedules[this.i * 7];
          return day ? format(toDate(day.date), "I") : null;
        }
      },
      periodInfo() {
        let filtered = [];
        for (let pid in this.periods) {
          if (this.periods[pid].description) {
            filtered.push(this.periods[pid]);
          }
        }
        return filtered;
      },
      faWeekPrev: () => faAngleDoubleLeft,
      faWeekNext: () => faAngleDoubleRight,
      faExpand: () => faPlusSquare,
      faCollapse: () => faMinusSquare,
    },
    methods: {
      toggleDay(event) {
        event.expanded = true;
      },
      previousWeek() {
        this.i = Math.max(this.i - 1, 0);
      },
      nextWeek() {
        this.i = Math.min(this.i + 1, (this.schedules.length / 7) - 1);
      },
    },
    components: { DateTime, FontAwesomeIcon }
  };
</script>

<style lang="scss">
  @import "../../scss/variables";

  .zxc-weekly-schedules {
    th[scope="row"] {
      font-weight: unset;
    }

    .toolbar {
      button {
        color: unset;
      }

      h2 {
        line-height: 1.8;
      }
    }

    .week-label {
      flex-grow: 1;
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
