
import format from "date-fns/format";
import toDate from "date-fns/toDate";
import isSameDay from "date-fns/isSameDay";

class Library {
  constructor(data, refs) {
    this.__data = data;
    this.__refs = refs;

    if ("schedules" in data) {
      data.schedules = [...new SchedulesV3Adapter(data.schedules)];

      // let today = format(new Date, "YYYY-MM-dd");
      // data.schedules.forEach(day => day.expanded = (day.date == today));
    }
  }

  get id() {
    return this.__data.id;
  }

  get name() {
    return this.__data.name;
  }

  get shortName() {
    return this.__data.shortName;
  }

  get slug() {
    return this.__data.slug;
  }

  get slogan() {
    if (this.__data.extra) {
      return this.__data.extra.slogan;
    }
  }

  get description() {
    if (this.__data.extra) {
      return this.__data.extra.description;
    }
  }

  get transit() {
    if (this.__data.extra) {
      return this.__data.extra.transit;
    }
  }

  get address() {
    return this.__data.address;
  }

  get mailAddress() {
    return this.__data.mail_address;
  }

  get email() {
    return this.__data.email;
  }

  get phone() {
    if (this.__data.phone_numbers) {
      return this.__data.phone_numbers[0];
    }
  }

  get schedules() {
    return this.__data.schedules || [];
  }

  get periods() {
    return this.__refs.period || {};
  }

  get pictures() {
    return this.__data.pictures || [];
  }

  get services() {
    return this.__data.services || [];
  }

  get phoneNumbers() {
    return this.__data.phone_numbers || [];
  }

  get links() {
    return this.__data.links || [];
  }

  get cover() {
    if (this.pictures.length) {
      return this.pictures[0];
    }
  }
}

class SchedulesV3Adapter {
  constructor(days) {
    this.__days = days;
  }

  convertTime(time, self_service) {
    time.staff = !self_service;
    time.from = time.opens;
    time.to = time.closes;

    delete time.opens;
    delete time.closes;

    return time;
  }

  toV4(day) {
    let times = [];

    for (let time of day.times) {
      times.push(this.convertTime(time));
    }

    if (day.sections.selfservice) {
      for (let time of day.sections.selfservice.times) {
        times.push(this.convertTime(time, true));
      }

      times.sort((a, b) => {
        if (a.from != b.from) {
          return a.from < b.from ? -1 : 1
        }

        if (a.to != b.to) {
          return a.to < b.to ? -1 : 1;
        }

        return 0;
      });

      for (let i = 1; i < times.length; i++) {
        let time = times[i];
        let prev = times[i - 1];

        if (prev.from == time.from) {
          time.from = prev.to;
        }

        if (prev.to > time.from) {
          let tmp = prev.to;
          prev.to = time.from;

          if (tmp > time.to) {
            let extra = {
              from: time.to,
              to: tmp,
              staff: prev.staff
            };

            times.splice(i + 1, 0, extra);
          }

          if (prev.from == prev.to) {
            times.splice(i, 1);
          }
        }
      }
    }

    for (let i = 1; i < times.length; i++) {
      let time = times[i];
      let prev = times[i - 1];

      if (prev.to < time.from) {
        let closed = {
          from: prev.to,
          to:  time.from,
          closed: true,
        };

        times.splice(i, 0, closed);
      }
    }

    if (times.length > 0) {
      day.opens = times[0].from;
      day.closes = times[times.length - 1].to;
      day.closed = false;
    } else {
      day.opens = null;
      day.closes = null;
      day.closed = true;
    }

    times.forEach((time) => {
      time.status = time.closed ? 0 : (time.staff ? 1 : 2);
    });

    day.times = times;
    return day;
  }

  * [Symbol.iterator]() {
    for (let day of this.__days) {
      let converted = this.toV4(day);

      if (isSameDay(toDate(converted.date), new Date)) {
        converted.live_status = 1;
      }

      yield converted;
    }
  }
}

class DayNameGenerator {
  constructor(days) {
    this.__days = days;
  }

  * [Symbol.iterator]() {
    for (let day of this.__days) {
      day.name = format(toDate(day.date), "iiii");

      yield day;
    }
  }
}

class WeekGroupGenerator {
  constructor(days) {
    this.__days = days;
  }

  * [Symbol.iterator]() {
    let days = [...this.__days];

    for (let i = 0; i < days.length; i += 7) {
      let week = new Array(7);

      for (let j = 0; j < 7; j++) {
        week[j] = days[i + j];
      }

      yield week;
    }
  }
}

export default Library;
