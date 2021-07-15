<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>


      <h2>{{ $t('global.AdminUsers') }}</h2>

      <router-link :to="{ name: 'UserAdd' }">
        <md-button class="md-fab turkis md-fixed md-fab-top-right">
          <md-tooltip md-direction="left">{{ $t('global.CreateAdmin') }}</md-tooltip>
          <md-icon>add</md-icon>
        </md-button>
      </router-link>

      <div class="space4"></div>

      <md-table
        md-card v-model="users"
        @md-selected="onSelectUser"
        :md-sort.sync="currentSort"
        :md-sort-order.sync="currentSortOrder"
        :md-sort-fn="customSort"
      >
        <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
          <md-table-cell :md-label="$t('global.Image')">
            <img
              class="circle profile-image"
              :src="item.image ? Imgix(item.image.filename, {w:80,h:80, fit:'crop'}) : avatarSvg"
            >
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Name')" md-sort-by="name">{{ item.first_name + ' ' + item.last_name }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Email')" md-sort-by="email">
            <a :href="'mailto:' + item.email">
              {{ item.email }}
            </a>
          </md-table-cell>
        </md-table-row>

      </md-table>
    </div>

  </div>

</template>

<script>

  import LoadingAnimation from "./LoadingAnimation"
  import moment from 'moment'
  import YogoApi from '../gateways/YogoApi'
  import {mapGetters} from 'vuex'
  import Imgix from '@/services/Imgix'

  export default {
    components: {LoadingAnimation},
    name: 'Users',
    mixins: [Imgix],
    data() {
      return {

        users: [],
        loading: true,
        currentSort: 'name',
        currentSortOrder: 'asc',
      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
        'user',
      ]),
      avatarSvg: function () {
        return require('../assets/img/account.svg')
      },
    },
    methods: {
      async fetchUsers() {
        this.users = await YogoApi.get('/users?populate[]=image&admin=1')
        _.each(this.users, (u) => {u.name = `${u.first_name} ${u.last_name}`; })
        this.loading = false
      },

      onSelectUser(user) {
        if (user.id === this.user.id) {
          this.$router.push({name: 'ProfileEdit'})
          return
        }
        this.$router.push({name: 'UserEdit', params: {id: user.id}})
      },
      customSort (value) {
        return value.sort((a, b) => {
          const sortBy = this.currentSort

          if (this.currentSortOrder === 'asc') {
            return a[sortBy].localeCompare(b[sortBy])
          }

          return b[sortBy].localeCompare(a[sortBy])
        })
      },
    },
    created() {
      this.fetchUsers()
    },
  }
</script>
