<template>
  <div class="main-header" v-show="userIsLoggedIn">

    <md-menu md-size="medium" class="dropdown-button header__profile--container" md-align-trigger>
      <md-button md-menu-trigger class="dropdown-button profile--dropdown" v-show="userIsLoggedIn">
        <div class="profile--info">
          <span class="name">{{ user.first_name + ' ' + user.last_name }}</span>
          <img class="circle" :src="profileImageUrl">
          <!--<md-icon>account_circle</md-icon>-->
          <md-icon>keyboard_arrow_down</md-icon>
        </div>
      </md-button>

      <md-menu-content>
        <md-menu-item @click="$router.push({ name: 'ProfileEdit' })">
          <md-icon>settings</md-icon>
          {{ $t('global.ProfileSettings') }}
        </md-menu-item>
        <md-menu-item @click="goToTeacherModule" v-if="user.teacher">
          <md-icon>supervisor_account</md-icon>
          {{ $t('global.GoToTeacherModuleLabel') }}
        </md-menu-item>
        <md-menu-item v-on:click="logout()">
          <md-icon>power_settings_new</md-icon>
          {{ $t('global.SignOut') }}
        </md-menu-item>
      </md-menu-content>
    </md-menu>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import YogoApi from '../gateways/YogoApi'
import Imgix from '@/services/Imgix'

export default {
  name: 'YogoHeader',
  mixins: [Imgix],
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'userIsLoggedIn',
      'userName',
      'profileImageFilename',
      'user',
      'stateReady',
    ]),
    profileImageUrl() {
      return (this.user && this.user.image) ? this.Imgix(this.profileImageFilename, {
        w: 80,
        h: 80,
      }) : require('../assets/img/account.svg')
    },
  },
  methods: {
    async logout() {
      await YogoApi.post('/logout')
      await this.$store.dispatch('logout')
    },
    goToTeacherModule() {
      const documentLocation = document.location.href
      const matches = documentLocation.match(/https?:\/\/[\w\d:-]+\.yogo\.dk/)
      if (matches) {
        const baseUrl = matches[0]
        document.location = baseUrl + '/teacher'
      } else {
        console.log('Could not open teacher module. Current domain is not a .yogo.dk domain.')
      }
    },
    gotoTeacherSalaryReport() {
      const documentLocation = document.location.href
      // const matches = documentLocation.match(/https?:\/\/[\w\d:-]+\.yogo\.dk/)
      // if (matches) {
      //   const baseUrl = matches[0]
      document.location = baseUrl + '/undervisere/report_salary'
      // } else {
      //   console.log('Could not open teacher module. Current domain is not a .yogo.dk domain.')
      // }
    },

  },
}

</script>
