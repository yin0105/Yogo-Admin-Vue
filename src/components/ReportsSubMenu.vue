<template>
  <div>
    <div
      class="submenu__desktop--container"
      :class="{'slim-sub-menu': slimMenu}"
    >
      <h1>{{ $t('global.Reports') }}</h1>
      <ul>
        <li>
          <router-link :to="{ name: 'ReportTurnover' }">
            <md-icon>local_atm</md-icon>
            <span class="md-list-item-text">{{ $t('global.Turnover') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'ReportOrders' }">
            <md-icon>local_atm</md-icon>
            <span class="md-list-item-text">{{ $t('global.IndividualSales') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'ReportLivestream' }">
            <md-icon>live_tv</md-icon>
            <span class="md-list-item-text">{{ $t('global.Livestreams') }}</span>
          </router-link>
        </li>
        <li v-if="user.email.match(/@yogo\.dk$/)" class="yogo-only-menu-item">
          <router-link :to="{ name: 'ReportCustomers' }">
            <md-icon>group</md-icon>
            <span class="md-list-item-text">{{ $t('global.Customers') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'ReportSalary' }">
            <md-icon>payment</md-icon>
            <span class="md-list-item-text">{{ $t('global.Salary') }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

  import { mapGetters } from 'vuex'

  export default {
    name: 'ReportsSubmenu',
    computed: {
      ...mapGetters([
        'client',
        'user',
        'slimMenu'
      ]),
    },
  }
</script>

<style lang="scss" scoped>

  .settings-menu-icon-svg {
    width: 24px;
    height: 24px;
    margin-right: 10px;
  }

  .router-link-active {
    text-decoration: underline;
  }

   .slim-sub-menu {
    @media screen and (min-device-width: 1024px) {
      left: 63px;
      transition: .3s ease left;
    }
  }

</style>
