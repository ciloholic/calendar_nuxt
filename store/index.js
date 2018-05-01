import Vue from 'vue'
import Vuex from 'vuex'
import uuid from 'uuid/v1'
import firebase from '~/plugins/firebase'
import { firebaseMutations, firebaseAction } from 'vuexfire'
const db = firebase.database()
const projectsRef = db.ref('/projects')

Vue.use(Vuex)

const store = () => {
  return new Vuex.Store({
    state: {
      loading: false,
      projects: [],
      targetTask: {
        key: null,
        taskName: null,
        color: null
      }
    },
    getters: {
      loading: state => state.loading,
      projects: state => state.projects,
      targetTask: state => state.targetTask
    },
    mutations: {
      setLoading(state, { loading }) {
        state.loading = loading
      },
      ...firebaseMutations,
      setTargetTask(state, { targetTask }) {
        state.targetTask = targetTask
      }
    },
    actions: {
      SET_LOADING({ commit }, { loading }) {
        commit('setLoading', { loading })
      },
      GET_PROJECTS: firebaseAction(({ bindFirebaseRef }) => {
        bindFirebaseRef('projects', projectsRef)
      }),
      ADD_PROJECTS: firebaseAction((context, obj) => {
        projectsRef.push(obj)
      }),
      EDIT_PROJECTS: firebaseAction((context, obj) => {
        projectsRef.child(obj['.key']).update({ name: obj.name, color: obj.color })
      }),
      REMOVE_PROJECTS: firebaseAction((context, key) => {
        projectsRef.child(key).remove()
      }),
      ADD_TASKS: firebaseAction((context, obj) => {
        const children = projectsRef.child(`${obj['.key']}/children`)
        var tasks = []
        children.on('value', snap => {
          tasks = snap.val()
        })
        const newTask = { key: uuid(), name: obj.name }
        if (tasks != null) {
          tasks.push(newTask)
          children.set(tasks)
        } else {
          children.set([newTask])
        }
      }),
      EDIT_TASKS: firebaseAction((context, obj) => {
        projectsRef.child(`${obj['.key']}/children/${obj['index']}`).update({ name: obj.name })
      }),
      REMOVE_TASKS: firebaseAction((context, obj) => {
        projectsRef.child(`${obj['.key']}/children/${obj['index']}`).remove()
        const children = projectsRef.child(`${obj['.key']}/children`)
        var tasks = []
        children.on('value', snap => {
          tasks = snap.val()
        })
        if (tasks != null) {
          children.set(tasks.filter(v => v))
        } else {
          children.remove()
        }
      }),
      SET_TARGET_TASK({ commit }, { targetTask }) {
        commit('setTargetTask', { targetTask })
      }
    }
  })
}

export default store
