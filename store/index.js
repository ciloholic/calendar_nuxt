import Vue from 'vue'
import Vuex from 'vuex'
import firebase from '~/plugins/firebase'
import { firebaseMutations, firebaseAction } from 'vuexfire'
const db = firebase.database()
const recordsRef = db.ref('/records')

Vue.use(Vuex)

const createStore = () => {
  return new Vuex.Store({
    state: {
      records: []
    },
    getters: {
      records: state => state.records
    },
    mutations: {
      ...firebaseMutations
    },
    actions: {
      INIT_RECORDS: firebaseAction(({ bindFirebaseRef }) => {
        bindFirebaseRef('records', recordsRef)
      })
    }
  })
}

export default createStore
