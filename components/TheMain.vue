<template>
  <el-main>
    <div class="label-week-group">
      <div class="label-week">
        <el-button icon="el-icon-arrow-left" size="mini" @click="onPrevClick">Prev</el-button>
      </div>
      <div class="label-week">{{ labelWeekText }}</div>
      <div class="label-week">
        <el-button size="mini" @click="onNextClick">Next<i class="el-icon-arrow-right el-icon-right"></i></el-button>
      </div>
    </div>
    <div class="label-side-group">
      <ul>
        <li v-for="d in dayList" :key="d">{{ d + ':00' }}</li>
      </ul>
    </div>
    <div v-for="w in weekList" :key="w" class="day-group" :class="{today: isToday(days[w])}">
      <div class="day-label">{{ formatTime(days[w], 'MM/DD(ddd)') }}</div>
      <ul :data-date="formatTime(days[w], 'YYYY-MM-DD')">
        <!-- time list -->
        <li
          v-for="t in timeList"
          :key="t.id"
          :class="`day-time m${t.mm}`"
          :data-time="t.id"
          draggable="true"
          @dragstart="dragstart"
          @dragend="dragend">
        </li>
        <!-- event list -->
        <div
          v-for="event in dayEvent(days[w])"
          :key="event.recordId"
          class="eventBlock"
          :title="event.title"
          :data-project-id="event.projectId"
          :data-record-id="event.recordId"
          :style="setStyle(event)">
          {{ event.projectName }}
        </div>
      </ul>
    </div>
  </el-main>
</template>

<script>
import moment from 'moment'
moment.locale('ja')

export default {
  data() {
    return {
      weekList: Array.from(new Array(7)).map((_, i) => i),
      dayList: Array.from(new Array(27))
        .map((_, i) => ('00' + (i + 1)).slice(-2))
        .slice(6),
      timeList: [],
      days: [],
      currentDay: moment(),
      events: [
        {
          start: moment('2018-04-09 10:30', 'YYYY-MM-DD HH:mm'),
          end: moment('2018-04-09 11:00', 'YYYY-MM-DD HH:mm'),
          recordId: 83194,
          title: 'TEST01',
          projectId: 29,
          projectName: 'イベント０１',
          color: '#52bb1b'
        },
        {
          start: moment('2018-04-10 10:00', 'YYYY-MM-DD HH:mm'),
          end: moment('2018-04-10 12:15', 'YYYY-MM-DD HH:mm'),
          recordId: 83195,
          title: 'TEST02',
          projectId: 30,
          projectName: 'イベント０２',
          color: '#b2bb1b'
        },
        {
          start: moment('2018-04-12 13:00', 'YYYY-MM-DD HH:mm'),
          end: moment('2018-04-12 14:15', 'YYYY-MM-DD HH:mm'),
          recordId: 83196,
          title: 'TEST03',
          projectId: 31,
          projectName: 'イベント０３',
          color: '#521b1b'
        },
        {
          start: moment('2018-04-18 10:00', 'YYYY-MM-DD HH:mm'),
          end: moment('2018-04-18 12:15', 'YYYY-MM-DD HH:mm'),
          recordId: 83197,
          title: 'TEST04',
          projectId: 31,
          projectName: 'イベント０４',
          color: '#b2bb1b'
        }
      ]
    }
  },
  created() {
    this.setCalendar(moment())
    // 時刻一覧を生成
    const minutesList = Array.from(new Array(4)).map((_, i) => ('00' + i * 15).slice(-2))
    Array.from(this.dayList).forEach(i => {
      minutesList.forEach(j => {
        this.timeList.push({ id: i + ':' + j, hh: i, mm: j })
      })
    })
  },
  computed: {
    labelWeekText: function() {
      const min = Math.min.apply(null, this.weekList)
      const max = Math.max.apply(null, this.weekList)
      return `${this.formatTime(this.days[min], 'YYYY/MM/DD')} 〜 ${this.formatTime(this.days[max], 'MM/DD')}`
    }
  },
  methods: {
    setCalendar(dayMoment) {
      // 各曜日のmoment一覧を生成
      this.days = []
      Array.from(new Array(7))
        .map((_, i) => i)
        .forEach(i => {
          this.days.push(dayMoment.clone().day(i))
        })
    },
    setStyle(event) {
      const template = 'background: __COLOR__;border-color: __COLOR__;top: __TOP__px;height: __HEIGHT__px;'
      const top = (event.start.hours() - 7) * 48 + event.start.minutes() / 15 * 12
      const height = (event.end.hours() - event.start.hours()) * 48 + event.end.minutes() / 15 * 12
      return template
        .replace(/__COLOR__/g, event.color)
        .replace(/__TOP__/g, top)
        .replace(/__HEIGHT__/g, height)
    },
    dayEvent(dayMoment) {
      return this.events.filter(event => event.start.isSame(dayMoment, 'day'))
    },
    isToday(dayMoment) {
      return moment().isSame(dayMoment, 'day')
    },
    formatTime(date, format) {
      return moment(date).format(format)
    },
    onPrevClick() {
      this.setCalendar(this.currentDay.subtract(1, 'weeks'))
    },
    onNextClick() {
      this.setCalendar(this.currentDay.add(1, 'weeks'))
    },
    dragstart: e => {
      console.log('start')
      console.log(e)
    },
    dragend: e => {
      console.log('end')
      console.log(e)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-main {
  background: rgba(255, 255, 255, 0.15);
  grid-area: main;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  height: calc(100vh - 40px);
  padding: 15px;
  user-select: none;
  cursor: crosshair;
  position: relative;
  border-radius: 3px;
}

.label-week-group {
  display: flex;
  justify-content: space-between;
  width: 100vw;
  margin-bottom: 12px;

  .label-week {
    font-size: 15px;
  }

  .label-week a {
    color: #dd8a61;
    font-size: 13px;
  }
}

.label-side-group {
  display: flex;

  ul {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 10px;
    line-height: 1em;
    padding: 26px 6px 43px 0;
  }
}

.day-group {
  flex: 1;

  ul {
    position: relative;
  }

  &.today {
    background: rgba(255, 255, 255, 0.15);
  }

  .day-label {
    font-size: 12px;
    text-align: center;
    padding: 3px 0;
  }

  .day-time {
    width: 100%;
    height: 12px;
    font-size: 10px;

    &:hover {
      background: #999;
    }

    &.m00 {
      border-top: 1px solid #888;
    }

    &.m15,
    &.m45 {
      border-top: 1px dotted #666;
    }

    &.m30 {
      border-top: 1px dashed #888;
    }
  }

  &:not(:first-child) {
    border-left: 1px solid #888;
  }

  &:last-child {
    border-right: 1px solid #888;
  }

  .eventBlock {
    border: 1px solid #fff;
    width: 100%;
    position: absolute;
    min-height: 12px;
    cursor: move;
    z-index: 10;
    transition: opacity 0.1s;
    display: flex;
    align-items: center;
    padding: 0 10px;
    font-size: 12px;
    line-height: 1.2em;
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
  }
}
</style>
