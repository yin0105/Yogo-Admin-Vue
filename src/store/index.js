import Vue from 'vue'
import Vuex from 'vuex'
import YogoApi from '@/gateways/YogoApi'
import router from '@/router'
import envConfig from '../../env_config'
import _sortBy from 'lodash/sortBy'
import { v4 as uuidv4 } from 'uuid'

// State modules
import appSettings from './modules/appSettings';
import alert from './modules/alert';

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

const clientQueryString = '/clients/current' +
  '?populate[]=logo' +
  '&populate[]=logo_white' +
  '&populate[]=branches' +
  '&populate[]=settings';

export default new Vuex.Store({
  modules: {
    appSettings,
    alert
  },
  state: {
    user: null,
    envConfig: envConfig,
    apiRoot: envConfig.apiRoot,
    client: null,
    routerBase: '/admin',
    ready: false,
    flashMessages: [],
    requestedRoute: null,
    liveswitchDeviceId: '',
    slimMenu: false
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setSlimMenu(state, slimMenu) {
      state.slimMenu = slimMenu
    },
    clearUser(state) {
      state.user = null
    },
    setClient(state, client) {
      state.client = client
    },
    setReady(state) {
      state.ready = true
    },
    postFlashMessage(state, payload) {
      state.flashMessages.push({
        type: payload.type,
        text: payload.text,
      })
      while (state.flashMessages.length > 10) {
        state.flashMessages.shift()
      }
    },
    updateClientSetting(state, payload) {
      state.client.settings[payload.key] = payload.value
    },
    setRequestedRoute(state, requestedRoute) {
      state.requestedRoute = requestedRoute
    },
    setLiveswitchDeviceId(state, liveswitchDeviceId) {
      state.liveswitchDeviceId = liveswitchDeviceId
    },
  },
  getters: {
    userIsLoggedIn(state) {
      return !!state.user
    },
    userName(state) {
      if (state.user) {
        return state.user.firstname + ' ' + state.user.lastname
      } else {
        return ''
      }
    },
    user(state) {
      return state.user
    },
    slimMenu(state) {
      return state.slimMenu
    },
    profileImageFilename(state) {
      return (state.user && state.user.image) ? state.user.image.filename : ''
    },
    stateReady(state) {
      return state.ready
    },
    flashMessages(state) {
      return state.flashMessages
    },
    requestedRoute(state) {
      return state.requestedRoute
    },
    apiRoot(state) {
      return state.apiRoot
    },
    client(state) {
      return state.client
    },
    googleWebFontsApiKey(state) {
      return state.envConfig.googleWebFontsApiKey
    },
    liveswitchDeviceId(state) {
      return state.liveswitchDeviceId
    },
  },
  actions: {
    logout({ commit }) {
      commit('clearUser')
      window.sessionStorage.removeItem('accessToken')
      window.sessionStorage.removeItem('user')
      window.localStorage.removeItem('accessToken')
      window.localStorage.removeItem('user')
      router.push({ name: 'Login' })
    },
    async init({ dispatch, commit, state }) {
      commit('setLiveswitchDeviceId', uuidv4())

      let requests = [
        YogoApi.get(clientQueryString),
        YogoApi.get('/get-login-status'),
      ]

      let results = await Promise.all(requests)

      const client = results[0]
      client.branches = _sortBy(client.branches, 'sort')
      commit('setClient', client)
      dispatch('appSettings/update', client.settings)

      const loginStatus = results[1]

      if (loginStatus.status === 'LOGGED_IN') {
        await dispatch('updateUser', loginStatus.user.id)
        commit('setReady')
        if (router.currentRoute.name === 'Init') {
          if (state.requestedRoute) {
            const requestedRoute = _.pick(state.requestedRoute, ['name', 'params'])
            commit('setRequestedRoute', null)
            router.push(requestedRoute)
          } else {
            router.push({ name: 'Dashboard' })
          }

        }
      } else {
        commit('setReady')
        if (router.currentRoute.name === 'Init' || router.currentRoute.meta.requireAuth !== false) {
          // requireAuth might be undefined, which should be taken as "true"
          router.push({ name: 'Login' })
        }
      }

    },
    async updateClientSettings({commit, dispatch}, userId) {
      const client = await YogoApi.get(clientQueryString);
      commit('setClient', client);
      await dispatch('appSettings/update', client.settings);
    },
    async updateUser({ commit }, userId) {
      const user = await YogoApi.get('/users/' + userId +
        '?populate[]=image',
      )
      commit('setUser', user)
    },
  },
  strict: debug,
})
