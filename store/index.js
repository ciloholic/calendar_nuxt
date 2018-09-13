import Vue from 'vue'
import Vuex from 'vuex'
import uuid from 'uuid/v1'
import firebase from '~/plugins/firebase'
import { firebaseMutations, firebaseAction } from 'vuexfire'
import moment from '~/plugins/moment'

const db = firebase.database()
const projectsRef = db.ref('/projects')
const eventsRef = db.ref('/events')
const usersRef = db.ref('/users')
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
        startTime: moment('07:00:00', 'HH:mm').format('HH:mm'),
        endTime: moment('23:00:00', 'HH:mm').format('HH:mm')
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
      ...firebaseMutations,
      setUser(state, user) {
        state.user = user
      },
      setLoading(state, { loading }) {
        state.loading = loading
      },
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
      googleLogin() {
        return new Promise((resolve, reject) => {
          firebase
            .auth()
            .signInWithRedirect(provider)
            .then(() => resolve())
            .catch(err => reject(err))
        })
      },
      googleLogout({ commit }) {
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
      setUser({ commit }, user) {
        commit('setUser', user)
        if (!user) return
        const obj = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email
        }
        usersRef.child(user.uid).set(obj)
      },
      setLoading({ commit }, { loading }) {
        commit('setLoading', { loading })
      },
      getProjects: firebaseAction(({ bindFirebaseRef }, { uid }) => {
        bindFirebaseRef('projects', projectsRef.orderByChild('uid').equalTo(uid))
      }),
      addProject: firebaseAction((context, obj) => {
        projectsRef.push(obj)
      }),
      editProject: firebaseAction((context, obj) => {
        projectsRef.child(obj['.key']).update({ name: obj.name, color: obj.color })
      }),
      removeProject: firebaseAction((context, key) => {
        projectsRef.child(key).update({ delete: true })
      }),
      addTask: firebaseAction((context, obj) => {
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
      editTask: firebaseAction((context, obj) => {
        projectsRef.child(`${obj['.key']}/children/${obj['index']}`).update({ name: obj.name })
      }),
      removeTask: firebaseAction((context, obj) => {
        projectsRef.child(`${obj['.key']}/children/${obj['index']}`).update({ delete: obj.delete })
      }),
      getEvents: firebaseAction(({ bindFirebaseRef }, { uid }) => {
        bindFirebaseRef('events', eventsRef.orderByChild('uid').equalTo(uid))
      }),
      addEvent: firebaseAction((context, obj) => {
        eventsRef.push(obj)
      }),
      editEvent: firebaseAction((context, obj) => {
        const key = obj['.key']
        delete obj['.key']
        eventsRef.child(key).update(obj)
      }),
      removeEvent: firebaseAction((context, key) => {
        eventsRef.child(key).remove()
      }),
      setTargetTask({ commit }, { targetTask }) {
        commit('setTargetTask', { targetTask })
      },
      setOption({ commit }) {
        commit('setOption')
      },
      getOption({ commit }) {
        commit('getOption')
      },
      updateCalendar({ commit }, updateCalendar) {
        commit('updateCalendar', updateCalendar)
      }
    }
  })
}

export default store
