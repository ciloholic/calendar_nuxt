import Vue from 'vue'
import Vuex from 'vuex'
import firebase from '~/plugins/firebase'
import { firebaseMutations, firebaseAction } from 'vuexfire'
const db = firebase.database()
const projectsRef = db.ref('/projects')

Vue.use(Vuex)

const store = () => {
  return new Vuex.Store({
    state: {
      loading: false,
      projects: []
    },
    getters: {
      loading: state => state.loading,
      projects: state => state.projects
    },
    mutations: {
      setLoading(state, { loading }) {
        state.loading = loading
      },
      ...firebaseMutations
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
      UPDATE_PROJECTS: firebaseAction((context, obj) => {
        projectsRef.child(obj['.key']).update({ name: obj.name, color: obj.color })
      }),
      DELETE_PROJECTS: firebaseAction((context, key) => {
        projectsRef.child(key).remove()
      })
    }
  })
}

export default store
