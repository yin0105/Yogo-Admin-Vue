import './polyfills/object.values.polyfill'

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import store from './store'
import router from './router'
import lodash from 'lodash'
import i18n from './includes/i18n'
// Form validation
import Vuelidate from 'vuelidate'
// CKEditor
import CKEditor from '@ckeditor/ckeditor5-vue'
// Vue Material
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'

import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)

global.jQuery = require('jquery')
var $ = global.jQuery
window.$ = $

Object.defineProperty(Vue.prototype, '$lodash', { value: lodash })


Vue.use(Vuelidate)

// Load all filters
require('./filters/index')

// Moment
const moment = require('moment-timezone')
require('moment/locale/da')

Vue.use(require('vue-moment'), {
  moment,
})

Vue.use(CKEditor)

Vue.use(VueMaterial)
Vue.prototype.$material.locale = {
  startYear: 1900,
  endYear: 2099,
  dateFormat: 'dd-MM-yyyy', // This needs to be here.
  days: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
  shortDays: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
  shorterDays: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  months: ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dec'],
  shorterMonths: ['J', 'F', 'M', 'A', 'M', 'Ju', 'Ju', 'A', 'Se', 'O', 'N', 'D'],
  firstDayOfAWeek: 1
}


// Global styles
require('./assets/styl/style.styl')
require('./assets/scss/style.scss')

require('vuedraggable')

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  store,
  router,
  render: h => h(App),
}).$mount('#app');
