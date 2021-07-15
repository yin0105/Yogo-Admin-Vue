import pick from 'lodash/pick'
import assign from 'lodash/assign'

export const SHOW = 'SHOW';
export const RESET = 'RESET';
export const SET_CALLBACK = 'SET_CALLBACK';

const allowedSettingKeys = ['title', 'message'];

const initialState = () => ({
  title: '',
  message: '',
  callback: null,
})

const getters = {
  title: state => state.title,
  message: state => state.message,
  callback: state => state.callback,
}

const actions = {
  show({ commit }, settings) {
    commit(SHOW, pick(settings, allowedSettingKeys))
  },
  reset({ commit }) {
    commit(RESET);
  },
  setCallback({commit}, callback) {
    commit(SET_CALLBACK, callback)
  }
}

const mutations = {
  [SHOW]: (state, settings) => {
    assign(state, settings)
  },
  [RESET]: (state) => {
    state.title = '';
    state.message = '';
  },
  [SET_CALLBACK]: (state, callback) => {
    state.callback = callback;
  }
}

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
}
