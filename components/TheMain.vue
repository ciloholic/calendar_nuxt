<template>
  <el-main>
    <!-- header -->
    <div class="week-label-group">
      <div class="week-label">
        <el-button icon="el-icon-arrow-left" size="mini" @click="onPrevClick">Prev</el-button>
      </div>
      <div class="week-label">{{ labelWeekText }}</div>
      <div class="week-label">
        <el-button size="mini" @click="onNextClick">Next<i class="el-icon-arrow-right el-icon-right"></i></el-button>
      </div>
    </div>
    <!-- side label -->
    <div class="side-label-group">
      <ul>
        <li v-for="d in dayList" :key="d">{{ d + ':00' }}</li>
      </ul>
    </div>
    <!-- main calendar -->
    <div v-for="w in weekList" :key="w" class="day-group" :class="{today: isToday(days[w])}">
      <div class="day-label">{{ formatTime(days[w], 'MM/DD(ddd)') }}</div>
      <ul
        @mouseup="mouseup"
        @mouseleave="mouseleave"
        @mousedown="mousedown"
        @mousemove="mousemove">
        <li
          v-for="t in timeList"
          :key="t.id"
          :class="`day-time m${t.mm}`"
          :data-date="`${formatTime(days[w], 'YYYY-MM-DD')} ${t.id}`">
        </li>
        <!-- event list -->
        <div
          v-for="event in dayEvent(days[w])"
          class="eventBlock"
          :key="event.recordId"
          :title="event.title"
          :data-project-id="event.projectId"
          :data-record-id="event.recordId"
          :style="setStyle(event)">
          {{ event.projectName }}
        </div>
        <!-- target event -->
        <div
          v-if="targetEvent.dragFlag && isTargetDay(days[w])"
          class="eventBlock selected"
          :style="setStyle(targetEvent, true)">
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
      MIN_HEIGHT: 12,
      MIN_MINUTES: 15,
      weekList: Array.from(new Array(7)).map((_, i) => i),
      dayList: Array.from(new Array(24)).map((_, i) => ('00' + i).slice(-2)),
      currentDay: moment(),
      timeList: [],
      days: [],
      events: [],
      targetEvent: {
        dragFlag: false,
        datetime: null,
        minutes: null,
        startY: null,
        recordId: null,
        title: null,
        projectId: null,
        projectName: null,
        color: null
      }
    }
  },
  created() {
    // 各曜日のmoment一覧を生成
    this.setCalendar(moment())
    // 時刻一覧を生成
    const minutesList = Array.from(new Array(4)).map((_, i) => ('00' + i * this.MIN_MINUTES).slice(-2))
    Array.from(this.dayList).forEach(i => {
      minutesList.forEach(j => {
        this.timeList.push({ id: `${i}:${j}:00`, hh: i, mm: j })
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
      this.days = []
      this.weekList.forEach(i => {
        this.days.push(dayMoment.clone().day(i))
      })
    },
    setStyle(event, targetEvent = false) {
      const top = event.datetime.hours() * 48 + event.datetime.minutes() / this.MIN_MINUTES * this.MIN_HEIGHT
      const height = event.minutes / this.MIN_MINUTES * this.MIN_HEIGHT
      const color = targetEvent ? event.color : this.convRgba(event.color)
      return `background:${color};border-color:${event.color};top:${top}px;height:${height}px;`
    },
    convRgba(color, alpha = 0.5) {
      const rgba = {
        r: parseInt(color.slice(1, 3), 16),
        g: parseInt(color.slice(3, 5), 16),
        b: parseInt(color.slice(5, 7), 16),
        a: alpha
      }
      return `rgba(${Object.values(rgba).join(',')})`
    },
    dayEvent(dayMoment) {
      return this.events.filter(event => event.datetime.isSame(dayMoment, 'day'))
    },
    isToday(dayMoment) {
      return moment().isSame(dayMoment, 'day')
    },
    isTargetDay(dayMoment) {
      return this.targetEvent.datetime.isSame(dayMoment, 'day')
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
    addEvent() {
      const obj = {
        datetime: this.targetEvent.datetime,
        minutes: this.targetEvent.minutes,
        recordId: this.targetEvent.recordId,
        title: this.targetEvent.title,
        projectId: this.targetEvent.projectId,
        projectName: this.targetEvent.projectName,
        //color: this.targetEvent.color
        color: '#52bb1b'
      }
      this.events.push(obj)
    },
    resetEvent() {
      this.targetEvent.dragFlag = false
      this.targetEvent.datetime = null
      this.targetEvent.minutes = null
      this.targetEvent.startY = null
      this.targetEvent.recordId = null
      this.targetEvent.title = null
      this.targetEvent.projectId = null
      this.targetEvent.projectName = null
      this.targetEvent.color = null
    },
    mouseup: function(e) {
      if (this.targetEvent.dragFlag) {
        const minutes = e.pageY - this.targetEvent.startY + this.MIN_HEIGHT
        this.targetEvent.minutes = Math.ceil(minutes / this.MIN_HEIGHT) * this.MIN_MINUTES
        this.addEvent()
        this.resetEvent()
      }
    },
    mouseleave: function() {
      if (this.targetEvent.dragFlag) {
        this.resetEvent()
      }
    },
    mousedown: function(e) {
      this.targetEvent.dragFlag = true
      this.targetEvent.datetime = moment(e.target.dataset.date, 'YYYY-MM-DD HH:mm:ss')
      this.targetEvent.minutes = this.MIN_MINUTES
      this.targetEvent.startY = e.pageY
      this.targetEvent.recordId = moment().unix()
      this.targetEvent.title = 'title'
      this.targetEvent.projectId = 'projectId'
      this.targetEvent.projectName = 'projectName'
      this.targetEvent.color = '#999'
    },
    mousemove: function(e) {
      if (this.targetEvent.dragFlag) {
        const minutes = e.pageY - this.targetEvent.startY + this.MIN_HEIGHT
        if (minutes > 0) {
          this.targetEvent.minutes = Math.ceil(minutes / this.MIN_HEIGHT) * this.MIN_MINUTES
        }
      }
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

.week-label-group {
  display: flex;
  justify-content: space-between;
  width: 100vw;
  margin-bottom: 12px;

  .week-label {
    font-size: 15px;
  }

  .week-label a {
    color: #dd8a61;
    font-size: 13px;
  }
}

.side-label-group {
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

    &.selected {
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
