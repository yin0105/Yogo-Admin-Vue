<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>ClassPass Integrations</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--50">
          <div>
            <md-checkbox v-model="form.classpass_com_integration_enabled" v-on:change="changeEnable">{{ $t('classpass.EnableClasspassIntegration') }}</md-checkbox>
          </div>
          <div v-if="form.classpass_com_integration_enabled">
            <md-checkbox v-model="form.classpass_com_release_all_seats_before_class_start">{{ $t('classpass.ReleaseAllUnbookedSeats') }}</md-checkbox>
          </div>
          <div class="mt-4">
            <label>{{ $t('classpass.TimeBeforeClass') }}</label>
            <HoursMinutesInput v-bind:minutes.sync="form.classpass_com_release_all_seats_minutes_before_class_start"></HoursMinutesInput>
          </div>
        </div>

        <md-button class="md-raised md-primary" @click="preSubmit">{{ $t('global.Save') }}</md-button>
      </div>

    </div>

    <md-dialog :md-active.sync="showConfirmEnabledDialog">
      <md-dialog-title>{{ $t('classpass.ClassPassIntegrationEnabled') }}</md-dialog-title>
      <md-dialog-content>
        <pre>{{ $t('classpass.YouCanNowLet') }}<router-link :to="{ name: 'ClassesEditMultiple' }">{{ $t('classpass.EditMultipleClasses') }}</router-link></pre>
      </md-dialog-content>
    </md-dialog>

    <md-dialog :md-active.sync="showConfirmDisabledDialog">
      <md-dialog-title>{{ $t('classpass.DisableClassPassIntegration') }}</md-dialog-title>
      <md-dialog-content>
        <pre>{{ $t('classpass.DoYouWantToDisable') }}</pre>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showConfirmDisabledDialog = false; ">Cancel</md-button>
        <md-button class="md-primary" @click="showConfirmDisabledDialog = false; submit(); ">OK</md-button>
      </md-dialog-actions>
    </md-dialog>
    <!--<md-dialog-alert
      :md-active.sync="showConfirmDisabledDialog"
      :md-title="$t('classpass.DisableClassPassIntegration')"
      ;md-content="<pre>$t('classpass.DoYouWantToDisable')</pre>" />-->

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
          classpass_com_release_all_seats_before_class_start: false,
          classpass_com_release_all_seats_minutes_before_class_start: 0,
        },

        pre_classpass_com_integration_enabled: false,
        showConfirmEnabledDialog: false,
        showConfirmDisabledDialog: false,

        confirmDisabled: false,

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
        '?keys[]=classpass_com_integration_enabled' +
        '&keys[]=classpass_com_release_all_seats_before_class_start' +
        '&keys[]=classpass_com_release_all_seats_minutes_before_class_start',
      )
      this.loading = false
      this.pre_classpass_com_integration_enabled = this.form.classpass_com_integration_enabled
    },
    watch: {
      form(newForm) {
        console.log("form changed");
      },
      classpass_com_integration_enabled(new_classpass_com_integration_enabled) {
        console.log(new_classpass_com_integration_enabled);
        if (!new_classpass_com_integration_enabled) this.classpass_com_release_all_seats_before_class_start = false;
      },
    },
    methods: {

      async preSubmit() {
        
        if (this.pre_classpass_com_integration_enabled !== this.form.classpass_com_integration_enabled) {
        
          if (this.form.classpass_com_integration_enabled) {
            await this.submit()
            this.showConfirmEnabledDialog = true
            console.log(await YogoApi.post('/v1/inventory/partners', {partner_id: this.client.id}));           
          } else {
            this.showConfirmDisabledDialog = true
          }

        } else {
          await this.submit()
        }
      },

      async submit() {

        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'classpass_com_integration_enabled',
            'classpass_com_release_all_seats_before_class_start',
            'classpass_com_release_all_seats_minutes_before_class_start',
          ],
        )

        await YogoApi.put(
          '/clients/' + this.client.id + '/settings',
          submitData,
        )
        this.loading = false
        this.pre_classpass_com_integration_enabled = this.form.classpass_com_integration_enabled

      },

      changeEnable() {
        if (!this.form.classpass_com_integration_enabled)
          this.form.classpass_com_release_all_seats_before_class_start = false;
      }
    },
  }

</script>
