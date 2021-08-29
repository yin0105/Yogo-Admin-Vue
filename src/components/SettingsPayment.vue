<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Payment') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div v-if="form.plan == ''">
          <SettingsPaymentSelectPlan v-bind.sync="planNum"></SettingsPaymentSelectPlan>
        </div>
        <div v-else class="flex--50">

          <div>
            <md-checkbox v-model="form.payment_show_visa_mastercard_logos">{{
                $t('global.ShowVisaMastercardLogos')
              }}
            </md-checkbox>
          </div>

          <div>
            <md-checkbox v-model="form.payment_show_dankort_logo">{{ $t('global.ShowDankortLogo') }}</md-checkbox>
          </div>

          <div>
            <md-checkbox v-model="form.payment_show_mobilepay_logo">{{ $t('global.ShowMobilepayLogo') }}</md-checkbox>
          </div>

          <md-field>
            <label>{{ $t('global.ReepayAPIkey') }}</label>
            <md-input type="text" v-model="form.payment_service_provider_reepay_private_api_key" required></md-input>
          
          </md-field>

          <md-field>
            <label>{{ $t('global.ReepayWebhookSecret') }}</label>
            <md-input type="text" v-model="form.payment_service_provider_reepay_webhook_secret" required></md-input>
          
          </md-field>

          <div class="mt2">
            <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
          </div>
        </div>

      </div>


      <div class="space8"></div>
      <div class="space8"></div>

    </div>
<!--
    <md-dialog :md-active.sync="step == 2" :md-close-on-esc="false"
               :md-click-outside-to-close="false">
      <md-dialog-title>{{ $t('global.CreatingClasses') }}</md-dialog-title>
      <md-dialog-content>
        {{ $t('payment.CountrySelectorWhichCountry')}}
      </md-dialog-content>
    </md-dialog>
-->
  </div>
</template>

<script>

import SettingsSubMenu from './SettingsSubMenu';
import LoadingAnimation from './LoadingAnimation';
import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';
import _pick from 'lodash/pick';

import SettingsPaymentSelectPlan from './SettingsPaymentSelectPlan';

export default {

  components: {
    SettingsSubMenu,
    LoadingAnimation,
    SettingsPaymentSelectPlan,
  },

  data() {
    return {
      loading: true,
      form: {},
      step: 1,

      planNum: {
        planNum: 0,
      },
      
    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  async created() {
    this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings' +
        '?keys[]=payment_show_visa_mastercard_logos' +
        '&keys[]=payment_show_dankort_logo' +
        '&keys[]=payment_show_mobilepay_logo' +
        '&keys[]=payment_service_provider_reepay_webhook_secret' +
        '&keys[]=payment_service_provider_reepay_private_api_key' +
        '&keys[]=plan' +
        '&keys[]=payment_service_provider',
    );
    console.log(" == plan = #", this.form.plan + "#")
    console.log(" == payment_service_provider = ", this.form.payment_service_provider)
    this.loading = false;
  },
  methods: {
    async submit() {
      this.loading = true;
      const submitData = _pick(
          this.form,
          [
            'payment_show_visa_mastercard_logos',
            'payment_show_dankort_logo',
            'payment_show_mobilepay_logo',
            'payment_service_provider_reepay_webhook_secret',
            'payment_service_provider_reepay_private_api_key',
          ],
      );
      await YogoApi.put('/clients/' + this.client.id + '/settings', submitData);
      this.loading = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.SettingsHasBeenUpdated'),
      });

    },
  },

  watch: {
    planNum: {
      handler: function (newPlanNum, oldPlanNum) {
        console.log("newPlanNum: ",newPlanNum)
        console.log("oldPlanNum: ",oldPlanNum)
        console.log("this.step: ",this.step)
        if ( newPlanNum.planNum > 0 && this.step == 1 ) {
          this.step = 2;
          console.log("step = ", this.step);
        }                    
      },
      deep: true,
    },
  },

};

</script>
