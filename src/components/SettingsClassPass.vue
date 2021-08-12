<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>ClassPass Integrations</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--50">
          <div>
            <md-checkbox v-model="form.classpass_com_integration_enabled">{{ $t('classpass.EnableClasspassIntegration') }}</md-checkbox>
          </div>
          <div v-if="form.classpass_com_integration_enabled">
            <md-checkbox v-model="form.classpass_com_release_seats_before_class_starts">{{ $t('classpass.ReleaseAllUnbookedSeats') }}</md-checkbox>
          </div>
          <div class="mt-4">
            <label>{{ $t('classpass.TimeBeforeClass') }}</label>
            <HoursMinutesInput v-bind:minutes.sync="form.classpass_com_release_seats_minutes_before_class_starts"></HoursMinutesInput>
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
  import HoursMinutesInput from '@/components/form/HoursMinutesInput';

  export default {
    name: 'SettingsClassPass',
    components: {
      LoadingAnimation,
      SettingsSubMenu,
      HoursMinutesInput,      
    },
    data() {
      return {
        loading: true,

        form: {
          classpass_com_integration_enabled: false,
          classpass_com_release_seats_before_class_starts: false,
          classpass_com_release_seats_minutes_before_class_starts: 0,
        },

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
        '?keys[]=signup_show_phone_field' +
        '&keys[]=signup_phone_field_required' +
        '&keys[]=signup_show_date_of_birth_field' +
        '&keys[]=signup_date_of_birth_field_required',
      )
      this.loading = false
    },
    watch: {
      form: {
        handler: (val) => {
          if (!val.signup_show_phone_field) {
            val.signup_phone_field_required = false
          }
          if (!val.signup_show_date_of_birth_field) {
            val.signup_date_of_birth_field_required = false
          }
        },
        deep: true,
      },
    },
    methods: {
      async submit() {
        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'signup_show_phone_field',
            'signup_phone_field_required',
            'signup_show_date_of_birth_field',
            'signup_date_of_birth_field_required',
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
