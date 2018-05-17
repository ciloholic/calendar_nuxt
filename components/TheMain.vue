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
        @mouseup="createMouseup"
        @mouseleave="createMouseleave"
        @mousedown="createMousedown"
        @mousemove="createMousemove">
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
          :key="event['.key']"
          :data-key="event['.key']"
          :data-datetime="formatTime(event.datetime, 'YYYY-MM-DD HH:mm:ss')"
          :style="setStyle(event)"
          @mouseup.stop="moveMouseup"
          @mouseleave.stop="moveMouseleave"
          @mousedown.stop="moveMousedown"
          @mousemove.stop="moveMousemove">
          {{ event.name }}
        </div>
        <!-- target event -->
        <div
          v-if="dragTarget.dragFlag && isTargetDay(days[w])"
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
    weekList: Array.from(new Array(7)).map((_, i) => i),
    dayList: Array.from(new Array(24)).map((_, i) => ('00' + i).slice(-2)),
    currentDay: moment(),
    timeList: [],
    days: [],
    projectMaster: [],
    showEvents: [],
    dragTarget: {
      dragFlag: false,
      datetime: null,
      minutes: null,
      startY: null
    },
    moveTarget: {
      moveFlag: false,
      key: null,
      startDatetime: null,
      endDatetime: null,
      startY: null
    }
  }),
  watch: {
    events: function() {
      this.createProjectMaster()
      this.convEvents()
    }
  },
  created() {
    // 各曜日のmoment一覧を生成
    this.setCalendar(moment())
    // 時刻一覧を生成
    const minutesList = Array.from(new Array(4)).map((_, i) => ('00' + i * MIN_MINUTES).slice(-2))
    Array.from(this.dayList).forEach(i => {
      minutesList.forEach(j => {
        this.timeList.push({ id: `${i}:${j}:00`, hh: i, mm: j })
      })
    })
    this.getEvents(this.user)
  },
  computed: {
    ...mapGetters(['user', 'projects', 'events', 'targetTask']),
    labelWeekText: function() {
      const min = Math.min.apply(null, this.weekList)
      const max = Math.max.apply(null, this.weekList)
      return `${this.formatTime(this.days[min], 'YYYY/MM/DD')} 〜 ${this.formatTime(this.days[max], 'MM/DD')}`
    }
  },
  methods: {
    ...mapActions({
      getEvents: 'GET_EVENTS',
      addEvents: 'ADD_EVENTS',
      editEvents: 'EDIT_EVENTS',
      setTargetTask: 'SET_TARGET_TASK'
    }),
    setCalendar(dayMoment) {
      this.days = []
      this.weekList.forEach(i => {
        this.days.push(dayMoment.clone().day(i))
      })
    },
    setStyle(event, target = false) {
      const top = event.datetime.hours() * 48 + event.datetime.minutes() / MIN_MINUTES * MIN_HEIGHT
      const height = event.minutes / MIN_MINUTES * MIN_HEIGHT
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
      return this.showEvents.filter(event => event.datetime.isSame(dayMoment, 'day'))
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
      this.showEvents = this.events.map(v => {
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
      this.dragTarget.dragFlag = false
      this.dragTarget.datetime = null
      this.dragTarget.minutes = null
      this.dragTarget.startY = null
    },
    createMouseup: function(e) {
      if (!this.dragTarget.dragFlag) return
      let height = e.pageY - this.dragTarget.startY + MIN_HEIGHT
      height = height >= MIN_HEIGHT ? height : MIN_HEIGHT
      this.dragTarget.minutes = Math.ceil(height / MIN_HEIGHT) * MIN_MINUTES
      const obj = {
        uid: this.user.uid,
        id: this.targetTask.id,
        datetime: this.formatTime(this.dragTarget.datetime, 'YYYY-MM-DD HH:mm:ss'),
        minutes: this.dragTarget.minutes,
        delete: false
      }
      this.addEvents(obj)
      this.resetDragTarget()
    },
    createMouseleave: function() {
      if (!this.dragTarget.dragFlag) return
      this.resetDragTarget()
    },
    createMousedown: function(e) {
      if (this.targetTask.id == null) {
        this.$message({ type: 'warning', message: 'タスクが未選択です' })
        return
      }
      this.dragTarget.dragFlag = true
      this.dragTarget.datetime = moment(e.target.dataset.date, 'YYYY-MM-DD HH:mm:ss')
      this.dragTarget.minutes = MIN_MINUTES
      this.dragTarget.startY = e.pageY
    },
    createMousemove: function(e) {
      if (!this.dragTarget.dragFlag) return
      const height = e.pageY - this.dragTarget.startY + MIN_HEIGHT
      if (height > 0) {
        this.dragTarget.minutes = Math.ceil(height / MIN_HEIGHT) * MIN_MINUTES
      }
    },
    moveMouseup: function(e) {
      if (!this.moveTarget.moveFlag) return
      if (this.moveTarget.endDatetime != null) {
        const obj = {
          '.key': this.moveTarget.key,
          datetime: this.formatTime(this.moveTarget.endDatetime, 'YYYY-MM-DD HH:mm:ss')
        }
        this.editEvents(obj)
      }
      this.resetMoveTarget()
    },
    moveMouseleave: function() {
      if (!this.moveTarget.moveFlag) return
      this.resetMoveTarget()
    },
    moveMousedown: function(e) {
      if (this.moveTarget.moveFlag) return
      this.moveTarget.moveFlag = true
      this.moveTarget.key = e.target.dataset.key
      this.moveTarget.startDatetime = moment(e.target.dataset.datetime, 'YYYY-MM-DD HH:mm:ss')
      this.moveTarget.startY = e.pageY
    },
    moveMousemove: function(e) {
      if (!this.moveTarget.moveFlag) return
      const height = e.pageY - this.moveTarget.startY
      if (height == 0) return
      const minutes = Math.ceil(height / MIN_HEIGHT) * MIN_MINUTES
      let datetime
      if (minutes > 0) {
        datetime = this.moveTarget.startDatetime.clone().add(minutes, 'minutes')
      } else {
        datetime = this.moveTarget.startDatetime.clone().subtract(Math.abs(minutes), 'minutes')
      }
      this.showEvents.forEach(v => {
        if (v['.key'] === this.moveTarget.key) {
          v.datetime = datetime
        }
      })
      this.moveTarget.endDatetime = datetime
    },
    resetMoveTarget() {
      this.moveTarget.moveFlag = false
      this.moveTarget.key = null
      this.moveTarget.startDatetime = null
      this.moveTarget.endDatetime = null
      this.moveTarget.startY = null
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

.time-line {
  border-top: 1px solid #dd8a61;
  height: 1px;
  position: absolute;
  top: 72px;
  left: 45px;
  right: 10px;
}
</style>
