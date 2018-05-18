import Vue from 'vue'
import Vuex from 'vuex'
import uuid from 'uuid/v1'
import firebase from '~/plugins/firebase'
import { firebaseMutations, firebaseAction } from 'vuexfire'
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
      }
    },
    getters: {
      user: state => state.user,
      isLogin: state => !!state.user,
      loading: state => state.loading,
      projects: state => state.projects,
      events: state => state.events,
      targetTask: state => state.targetTask
    },
    mutations: {
      setUser(state, { user }) {
        state.user = user || null
      },
      setLoading(state, { loading }) {
        state.loading = loading
      },
      ...firebaseMutations,
      setTargetTask(state, { targetTask }) {
        state.targetTask = targetTask
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
              commit('setUser', {})
              resolve()
            })
        })
      },
      SET_USER({ commit }, { user }) {
        commit('setUser', { user })
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
        eventsRef.child(`${obj['.key']}`).update({ datetime: obj.datetime })
      }),
      SET_TARGET_TASK({ commit }, { targetTask }) {
        commit('setTargetTask', { targetTask })
      }
    }
  })
}

export default store
