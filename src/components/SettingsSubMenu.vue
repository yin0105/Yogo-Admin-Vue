<template>
  <div>
    <div
      class="submenu__desktop--container"
      :class="{'slim-sub-menu': slimMenu}"
    >
      <h1>{{ $t('global.Settings') }}</h1>
      <ul>
        <li>
          <router-link :to="{ name: 'SettingsAppearance' }">
            <md-icon>settings_brightness</md-icon>
            <span class="md-list-item-text">{{ $t('global.Appearance') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsCheckin' }">
            <md-icon>mobile_friendly</md-icon>
            <span class="md-list-item-text">{{ $t('global.Checkin') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsSignup' }">
            <md-icon>person_add</md-icon>
            <span class="md-list-item-text">{{ $t('global.NewCustomers') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsFrontendMenu' }">
            <md-icon>menu</md-icon>
            <span class="md-list-item-text">{{ $t('global.Menu') }}</span>
          </router-link>
        </li>
        <li v-if="client.branches.length > 1">
          <router-link :to="{ name: 'SettingsBranches' }">
            <md-icon>home</md-icon>
            <span class="md-list-item-text">{{ $t('global.Branches') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsCalendar' }">
            <md-icon>calendar_today</md-icon>
            <span class="md-list-item-text">{{ $t('global.Calendar') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsMemberships' }">
            <md-icon>card_membership</md-icon>
            <span class="md-list-item-text">{{ $t('global.Memberships') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsNoShowFees' }">
            <md-icon>assignment_late</md-icon>
            <span class="md-list-item-text">{{ $t('global.NoShowFees') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsWaitingList' }">
            <img src="../assets/img/waiting-list.svg" class="settings-menu-icon-svg">
            <span class="md-list-item-text">{{ $t('global.Waitlist') }}</span>
          </router-link>
        </li>
        <li v-if="client.extended_video_enabled">
          <router-link :to="{ name: 'SettingsVideo' }">
            <md-icon>tv</md-icon>
            <span class="md-list-item-text">{{ $t('global.Video') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsLivestream' }">
            <md-icon>live_tv</md-icon>
            <span class="md-list-item-text">{{ $t('global.Livestream') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsGiftCards' }">
            <md-icon>card_giftcard</md-icon>
            <span class="md-list-item-text">{{ $t('global.GiftCards') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsMyProfile' }">
            <md-icon>face</md-icon>
            <span class="md-list-item-text">{{ $t('global.CustomerProfile') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsTerms' }">
            <md-icon>gavel</md-icon>
            <span class="md-list-item-text">{{ $t('global.Terms') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsEmail' }">
            <md-icon>email</md-icon>
            <span class="md-list-item-text">{{ $t('global.Email') }}</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'SettingsSms' }">
            <md-icon>smartphone</md-icon>
            <span class="md-list-item-text">Sms</span>
          </router-link>
        </li>
        <li v-if="user.email.match(/@yogo\.dk$/)" class="yogo-only-menu-item">
          <router-link :to="{ name: 'SettingsPayment' }">
            <md-icon>credit_card</md-icon>
            <span class="md-list-item-text">{{ $t('global.Payment') }}</span>
          </router-link>
        </li>
        <li v-if="user.email.match(/@yogo\.dk$/)" class="yogo-only-menu-item">
          <router-link :to="{ name: 'SettingsImportMBO' }">
            <md-icon>local_shipping</md-icon>
            <span class="md-list-item-text">Import MBO</span>
          </router-link>
        </li>
        <li v-if="user.email.match(/@yogo\.dk$/)" class="yogo-only-menu-item">
          <router-link :to="{ name: 'SettingsImportSportSolution' }">
            <md-icon>local_shipping</md-icon>
            <span class="md-list-item-text">Import SS</span>
          </router-link>
        </li>
        <li v-if="user.show_experimental_features" class="yogo-only-menu-item">
          <router-link :to="{ name: 'SettingsImportGeckoBooking' }">
            <md-icon>local_shipping</md-icon>
            <span class="md-list-item-text">Import Gecko</span>
          </router-link>
        </li>
        <li v-if="user.show_experimental_features" class="yogo-only-menu-item">
          <router-link :to="{ name: 'SettingsImportConventus' }">
            <md-icon>local_shipping</md-icon>
            <span class="md-list-item-text">Import Conventus</span>
          </router-link>
        </li>
        <li v-if="user.email.match(/@yogo\.dk$/)" class="yogo-only-menu-item">
          <router-link :to="{ name: 'SettingsImportSenses' }">
            <md-icon>local_shipping</md-icon>
            <span class="md-list-item-text">Import Senses</span>
          </router-link>
        </li>
        <li v-if="user.email.match(/@yogo\.dk$/)" class="yogo-only-menu-item">
          <router-link :to="{ name: 'SettingsImportMomoyoga' }">
            <md-icon>local_shipping</md-icon>
            <span class="md-list-item-text">Import Momoyoga</span>
          </router-link>
        </li>
        <li v-if="user.email.match(/@yogo\.dk$/)" class="yogo-only-menu-item">
          <router-link :to="{ name: 'SettingsImportGeneric' }">
            <md-icon>local_shipping</md-icon>
            <span class="md-list-item-text">Import generic</span>
          </router-link>
        </li>
        <li
          v-if="user.show_experimental_features || client.settings.client_can_see_client_export_page">
          <router-link :to="{ name: 'SettingsExport' }">
            <md-icon>local_shipping</md-icon>
            <span class="md-list-item-text">Eksport</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

  import { mapGetters } from 'vuex'

  export default {
    name: 'SettingsSubmenu',
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
    margin-right:10px;
  }

  .slim-sub-menu {
    @media screen and (min-device-width: 1024px) {
      left: 63px;
      transition: .3s ease left;
    }
  }

</style>
