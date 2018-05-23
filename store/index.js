import Vue from 'vue'
import Vuex from 'vuex'
import uuid from 'uuid/v1'
import firebase from '~/plugins/firebase'
import { firebaseMutations, firebaseAction } from 'vuexfire'
import moment from 'moment'
moment.locale('ja')

const db = firebase.database()
const projectsRef = db.ref('/projects')
const eventsRef = db.ref('/events')
const provider = new firebase.auth.GoogleAuthProvider()

Vue.use(Vuex)

const store = () => {
  return new Vuex.Store({
    state: {
      user: null,
      loading: false,
      projects: [],
      events: [],
      targetTask: {
        id: null,
        taskName: null,
        color: null
      },
      optionForm: {
        weekday: false,
        startTime: moment('09:00:00', 'HH:mm').format('HH:mm'),
        endTime: moment('20:00:00', 'HH:mm').format('HH:mm')
      },
      updateCalendar: false
    },
    getters: {
      user: state => state.user,
      isLogin: state => !!state.user,
      loading: state => state.loading,
      projects: state => state.projects,
      events: state => state.events,
      targetTask: state => state.targetTask,
      optionForm: state => state.optionForm,
      isCalendar: state => !!state.updateCalendar
    },
    mutations: {
      setUser(state, user) {
        state.user = user
      },
      setLoading(state, { loading }) {
        state.loading = loading
      },
      ...firebaseMutations,
      setTargetTask(state, { targetTask }) {
        state.targetTask = targetTask
      },
      setOption(state) {
        localStorage.setItem('weekday', state.optionForm.weekday)
        localStorage.setItem('startTime', state.optionForm.startTime)
        localStorage.setItem('endTime', state.optionForm.endTime)
      },
      getOption(state) {
        if (JSON.parse(localStorage.getItem('weekday'))) state.optionForm.weekday = true
        if (localStorage.getItem('startTime') != null) state.optionForm.startTime = localStorage.getItem('startTime')
        if (localStorage.getItem('endTime') != null) state.optionForm.endTime = localStorage.getItem('endTime')
      },
      updateCalendar(state, updateCalendar) {
        state.updateCalendar = updateCalendar
      }
    },
    actions: {
      LOGIN() {
        return new Promise((resolve, reject) => {
          firebase
            .auth()
            .signInWithRedirect(provider)
            .then(() => resolve())
            .catch(err => reject(err))
        })
      },
      LOGOUT({ commit }) {
        return new Promise((resolve, reject) => {
          firebase
            .auth()
            .signOut()
            .then(() => {
              commit('setUser', null)
              resolve()
            })
        })
      },
      SET_USER({ commit }, user) {
        commit('setUser', user)
      },
      SET_LOADING({ commit }, { loading }) {
        commit('setLoading', { loading })
      },
      GET_PROJECTS: firebaseAction(({ bindFirebaseRef }) => {
        bindFirebaseRef('projects', projectsRef)
      }),
      ADD_PROJECT: firebaseAction((context, obj) => {
        projectsRef.push(obj)
      }),
      EDIT_PROJECT: firebaseAction((context, obj) => {
        projectsRef.child(obj['.key']).update({ name: obj.name, color: obj.color })
      }),
      REMOVE_PROJECT: firebaseAction((context, key) => {
        projectsRef.child(key).update({ delete: true })
      }),
      ADD_TASK: firebaseAction((context, obj) => {
        const children = projectsRef.child(`${obj['.key']}/children`)
        let tasks = []
        children.on('value', snap => {
          tasks = snap.val()
        })
        const newTask = { id: uuid(), name: obj.name, delete: false }
        if (tasks != null) {
          tasks.push(newTask)
          children.set(tasks)
        } else {
          children.set([newTask])
        }
      }),
      EDIT_TASK: firebaseAction((context, obj) => {
        projectsRef.child(`${obj['.key']}/children/${obj['index']}`).update({ name: obj.name })
      }),
      REMOVE_TASK: firebaseAction((context, obj) => {
        projectsRef.child(`${obj['.key']}/children/${obj['index']}`).update({ delete: obj.delete })
      }),
      GET_EVENTS: firebaseAction(({ bindFirebaseRef }, { uid }) => {
        bindFirebaseRef('events', eventsRef.orderByChild('uid').equalTo(uid))
      }),
      ADD_EVENT: firebaseAction((context, obj) => {
        eventsRef.push(obj)
      }),
      EDIT_EVENT: firebaseAction((context, obj) => {
        const key = obj['.key']
        delete obj['.key']
        eventsRef.child(key).update(obj)
      }),
      REMOVE_EVENT: firebaseAction((context, key) => {
        eventsRef.child(key).remove()
      }),
      SET_TARGET_TASK({ commit }, { targetTask }) {
        commit('setTargetTask', { targetTask })
      },
      SET_OPTION({ commit }) {
        commit('setOption')
      },
      GET_OPTION({ commit }) {
        commit('getOption')
      },
      UPDATE_CALENDAR({ commit }, updateCalendar) {
        commit('updateCalendar', updateCalendar)
      }
    }
  })
}

export default store
