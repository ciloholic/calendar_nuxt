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
    <div v-for="(_, w) in weekList" :key="w" class="day-group" :class="{today: isToday(days[w])}">
      <div class="day-label">{{ formatTime(days[w], 'MM/DD(ddd)') }}</div>
      <ul
        @mousedown="mousedown"
        @mouseup="mouseup"
        @mouseleave="mouseleave"
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
          draggable="true"
          class="eventBlock"
          :class="{moved: moveTarget.flag && event['.key'] === moveTarget.key }"
          :key="event['.key']"
          :data-key="event['.key']"
          :data-datetime="formatTime(event.datetime, 'YYYY-MM-DD HH:mm:ss')"
          :style="setStyle(event)"
          @mousedown.stop
          @mouseup.stop="moveMouseup"
          @dragstart.stop="dragstart"
          @drag.stop="drag"
          @dragend.stop="dragend">
          {{ event.name }}
          <div @click.stop="removeClick" class="remove">
            <i class="el-icon-close"></i>
          </div>
        </div>
        <!-- target event -->
        <div
          v-if="dragTarget.flag && isTargetDay(days[w])"
          class="eventBlock selected"
          :style="setStyle(dragTarget, true)">
        </div>
      </ul>
    </div>
    <!-- time line -->
    <!--<div class="time-line" style="top: 87px;"></div>-->
  </el-main>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
moment.locale('ja')

const MIN_HEIGHT = 12
const MIN_MINUTES = 15

export default {
  head: {
    title: 'Main'
  },
  data: () => ({
    weekList: [],
    dayList: [],
    currentDay: moment(),
    timeList: [],
    days: [],
    projectMaster: [],
    showEvents: [],
    dragTarget: {
      flag: false,
      datetime: null,
      minutes: null,
      startY: null
    },
    moveTarget: {
      flag: false,
      key: null,
      startDatetime: null,
      endDatetime: null,
      startY: null
    }
  }),
  watch: {
    isCalendar: function(v) {
      if (!v) return
      this.setCalendar(moment())
      this.convEvents()
      this.updateCalendarAction(false)
    },
    events: function() {
      this.createProjectMaster()
      this.convEvents()
    }
  },
  created() {
    this.setCalendar(moment())
    this.getEventsAction(this.user)
  },
  computed: {
    ...mapGetters(['user', 'projects', 'events', 'targetTask', 'optionForm', 'isCalendar']),
    labelWeekText: function() {
      const start = this.formatTime(this.days[0], 'YYYY/MM/DD')
      const end = this.formatTime(this.days[this.days.length - 1], 'MM/DD')
      return `${start} 〜 ${end}`
    }
  },
  methods: {
    ...mapActions({
      getEventsAction: 'GET_EVENTS',
      addEventAction: 'ADD_EVENT',
      editEventAction: 'EDIT_EVENT',
      removeEvent: 'REMOVE_EVENT',
      setTargetTaskAction: 'SET_TARGET_TASK',
      updateCalendarAction: 'UPDATE_CALENDAR'
    }),
    setCalendar(dayMoment) {
      // 初期化
      this.timeList = []
      this.days = []
      // カレンダー初期設定
      if (this.optionForm.weekday) {
        this.weekList = Array.from(new Array(7)).map((_, i) => i)
      } else {
        this.weekList = Array.from(new Array(5)).map((_, i) => i + 1)
      }
      const dayList = Array.from(new Array(24)).map((_, i) => ('00' + i).slice(-2))
      this.dayList = dayList.filter(v =>
        moment(v, 'HH').isBetween(
          moment(this.optionForm.startTime, 'HH:mm'),
          moment(this.optionForm.endTime, 'HH:mm'),
          null,
          '[]'
        )
      )
      this.weekList.forEach(i => {
        this.days.push(dayMoment.clone().day(i))
      })
      // 時刻一覧を生成
      const minutesList = Array.from(new Array(4)).map((_, i) => ('00' + i * MIN_MINUTES).slice(-2))
      Array.from(this.dayList).forEach(i => {
        minutesList.forEach(j => {
          this.timeList.push({ id: `${i}:${j}:00`, hh: i, mm: j })
        })
      })
    },
    setStyle(event, target = false) {
      const baseTop = moment(this.optionForm.startTime, 'HH:mm').hours() * (MIN_HEIGHT * 4)
      const top =
        event.datetime.hours() * (MIN_HEIGHT * 4) + (event.datetime.minutes() / MIN_MINUTES) * MIN_HEIGHT - baseTop
      const height = (event.minutes / MIN_MINUTES) * MIN_HEIGHT
      const color = target ? this.convRgba('#ffffff') : this.convRgba(event.color)
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
      return this.showEvents.filter(v => v.datetime.isSame(dayMoment, 'day'))
    },
    isToday(dayMoment) {
      return moment().isSame(dayMoment, 'day')
    },
    isTargetDay(dayMoment) {
      return this.dragTarget.datetime.isSame(dayMoment, 'day')
    },
    formatTime(date, format) {
      return moment(date).format(format)
    },
    createProjectMaster() {
      let list = []
      this.projects.forEach(v => {
        if (v.children != null) {
          v.children.forEach(vv => {
            list[vv.id] = { name: vv.name, color: v.color }
          })
        }
      })
      this.projectMaster = list
    },
    convEvents() {
      const events = this.events.filter(v => {
        const target = moment(moment(v.datetime).format('HH:mm'), 'HH:mm')
        return target.isBetween(
          moment(this.optionForm.startTime, 'HH:mm'),
          moment(this.optionForm.endTime, 'HH:mm'),
          null,
          '[]'
        )
      })
      this.showEvents = events.map(v => {
        return {
          '.key': v['.key'],
          datetime: moment(v.datetime),
          minutes: v.minutes,
          name: this.projectMaster[v.id]['name'],
          color: this.projectMaster[v.id]['color']
        }
      })
    },
    onPrevClick() {
      this.setCalendar(this.currentDay.subtract(1, 'weeks'))
    },
    onNextClick() {
      this.setCalendar(this.currentDay.add(1, 'weeks'))
    },
    resetDragTarget() {
      this.dragTarget.flag = false
      this.dragTarget.datetime = null
      this.dragTarget.minutes = null
      this.dragTarget.startY = null
    },
    mousedown: function(e) {
      if (this.targetTask.id == null) {
        this.$message({ type: 'warning', message: 'タスクが未選択です' })
        return
      }
      this.dragTarget.flag = true
      this.dragTarget.datetime = moment(e.target.dataset.date, 'YYYY-MM-DD HH:mm:ss')
      this.dragTarget.minutes = MIN_MINUTES
      this.dragTarget.startY = e.pageY
    },
    mouseup: function(e) {
      if (!this.dragTarget.flag) return
      let height = e.pageY - this.dragTarget.startY + MIN_HEIGHT
      height = height >= MIN_HEIGHT ? height : MIN_HEIGHT
      this.dragTarget.minutes = Math.ceil(height / MIN_HEIGHT) * MIN_MINUTES
      const obj = {
        uid: this.user.uid,
        id: this.targetTask.id,
        datetime: this.formatTime(this.dragTarget.datetime, 'YYYY-MM-DD HH:mm:ss'),
        minutes: this.dragTarget.minutes
      }
      this.addEventAction(obj)
      this.resetDragTarget()
    },
    mouseleave: function() {
      if (!this.dragTarget.flag) return
      this.resetDragTarget()
    },
    mousemove: function(e) {
      if (!this.dragTarget.flag) return
      const height = e.pageY - this.dragTarget.startY + MIN_HEIGHT
      if (height > 0) {
        this.dragTarget.minutes = Math.ceil(height / MIN_HEIGHT) * MIN_MINUTES
      }
    },
    dragstart: function(e) {
      if (this.moveTarget.flag) return
      this.moveTarget.flag = true
      this.moveTarget.key = e.target.dataset.key
      this.moveTarget.startDatetime = moment(e.target.dataset.datetime, 'YYYY-MM-DD HH:mm:ss')
      this.moveTarget.startY = e.pageY
    },
    drag: function(e) {
      if (!this.moveTarget.flag) return
      const height = e.pageY - this.moveTarget.startY
      if (e.pageY === 0 || Math.abs(height) < MIN_HEIGHT) return
      const minutes = Math.ceil(height / MIN_HEIGHT) * MIN_MINUTES
      let datetime
      if (minutes > 0) {
        datetime = this.moveTarget.startDatetime.clone().add(minutes, 'minutes')
      } else {
        datetime = this.moveTarget.startDatetime.clone().subtract(Math.abs(minutes), 'minutes')
      }
      this.moveTarget.endDatetime = datetime
    },
    dragend: function(e) {
      if (!this.moveTarget.flag || this.moveTarget.endDatetime == null) return
      const obj = {
        '.key': this.moveTarget.key,
        datetime: this.formatTime(this.moveTarget.endDatetime, 'YYYY-MM-DD HH:mm:ss')
      }
      this.editEventAction(obj)
      this.resetMoveTarget()
    },
    resetMoveTarget() {
      this.moveTarget.flag = false
      this.moveTarget.key = null
      this.moveTarget.startDatetime = null
      this.moveTarget.endDatetime = null
      this.moveTarget.startY = null
    },
    removeClick(e) {
      this.removeEvent(e.target.parentNode.parentNode.dataset.key)
    },
    moveMouseup(e) {
      const height = e.target.offsetHeight >= MIN_HEIGHT ? e.target.offsetHeight : MIN_HEIGHT
      const obj = {
        '.key': e.target.dataset.key,
        minutes: Math.ceil(height / MIN_HEIGHT) * MIN_MINUTES
      }
      this.editEventAction(obj)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-main {
  background: rgba(255, 255, 255, 0.1);
  grid-area: main;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  height: calc(100vh - 40px);
  padding: 15px;
  user-select: none;
  position: relative;
  border-radius: 3px;
  cursor: crosshair;
}

.week-label-group {
  display: flex;
  justify-content: space-between;
  width: 100vw;
  margin-bottom: 12px;

  .week-label {
    font-size: 15px;
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
    background: rgba(255, 255, 255, 0.1);
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
    z-index: 10;
    transition: opacity 0.1s;
    display: flex;
    align-items: center;
    padding: 0 10px;
    font-size: 12px;
    line-height: 1.2em;
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
    resize: vertical;
    cursor: move;

    &.moved {
      opacity: 0.5;
    }

    .remove {
      display: none;
    }

    &:hover {
      overflow: hidden;

      & > .remove {
        background: #3c3a33;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        right: 0;
        width: 10px;
        height: 10px;
        font-size: 0.8em;
        cursor: default;
      }
    }
  }
}

.time-line {
  border-top: 1px solid #dd8a61;
  height: 1px;
  position: absolute;
  top: 72px;
  left: 45px;
  right: 10px;
}
</style>
