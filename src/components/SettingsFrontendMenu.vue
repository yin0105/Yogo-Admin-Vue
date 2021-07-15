<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Menu') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--50">
          <div>
            <md-checkbox v-model="form.frontend_show_menu_item_calendar">{{ $t('global.ShowMenuItemCalendar') }}</md-checkbox>
          </div>
          <div>
            <md-checkbox v-model="form.frontend_show_menu_item_events">{{ $t('global.ShowMenuItemEvents') }}</md-checkbox>
          </div>
          <div>
            <md-checkbox v-model="form.frontend_show_menu_item_prices">{{ $t('global.ShowMenuItemPrices') }}</md-checkbox>
          </div>
        </div>

        <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
      </div>

    </div>

  </div>

</template>

<script>

  import SettingsSubMenu from './SettingsSubMenu'
  import LoadingAnimation from "./LoadingAnimation"

  import YogoApi from '@/gateways/YogoApi'
  import {mapGetters} from 'vuex'

  import _pick from 'lodash/pick'

  export default {
    name: 'SettingsFrontendMenu',
    components: {
      LoadingAnimation,
      SettingsSubMenu,
    },
    data() {
      return {
        loading: true,

        form: null,
      }
    },
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    async created() {
      this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings' +
        '?keys[]=frontend_show_menu_item_calendar' +
        '&keys[]=frontend_show_menu_item_events' +
        '&keys[]=frontend_show_menu_item_prices'
      )
      this.loading = false
    },
    methods: {
      async submit() {
        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'frontend_show_menu_item_calendar',
            'frontend_show_menu_item_events',
            'frontend_show_menu_item_prices',
          ],
        )
        await YogoApi.put(
          '/clients/' + this.client.id + '/settings',
          submitData,
        )
        this.loading = false

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.SettingsHasBeenUpdated'),
        })

      },
    },
  }

</script>
