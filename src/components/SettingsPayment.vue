<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Payment') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div v-if="form.plan == ''">
          <SettingsPaymentSelectPlan v-bind.sync="plan"></SettingsPaymentSelectPlan>
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

    <md-dialog :md-active.sync="showCountryDlg" :md-close-on-esc="false"
               :md-click-outside-to-close="false">
      <!--<md-dialog-title>{{ $t('global.CreatingClasses') }}</md-dialog-title>-->
      <md-dialog-content>
        {{ $t('payment.CountrySelectorWhichCountry')}}
        <div>
          <md-radio v-model="countryDen" :value="true">{{ $t('payment.Denmark') }}</md-radio>
          <md-radio v-model="countryDen" :value="false">{{ $t('payment.OtherCountry') }}</md-radio>
        </div>
        <div v-if="!countryDen" class="dlg-msg">{{ $t('payment.CountrySelectorNotServe') }}</div>
        <div v-if="!countryDen" class="dlg-msg">{{ $t('payment.CountrySelectorIfAnyQuestions') }}</div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button v-if="countryDen" type="button" @click.prevent="cancelProgress()">
          {{ $t('global.Cancel') }}
        </md-button>
        <md-button v-if="countryDen" type="button" @click.prevent="selectCountry()">
          {{ $t('global.Continue') }}
        </md-button>
        <md-button v-if="!countryDen" type="button" @click.prevent="cancelProgress()">
          {{ $t('global.Ok') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showPreStripeDlg" :md-close-on-esc="false"
               :md-click-outside-to-close="false">
      <md-dialog-title>{{ $t('payment.PaymentSetupStripe') }}</md-dialog-title>
      <md-dialog-content>
        <div class="dlg-msg">{{ $t('payment.PaymentSetupStripeMsg1') }}</div>
        <div class="dlg-msg mt-4">{{ $t('payment.PaymentSetupStripeMsg2') }}</div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button v-if="countryDen" type="button" @click.prevent="cancelProgress()">
          {{ $t('global.Cancel') }}
        </md-button>
        <md-button v-if="countryDen" type="button" @click.prevent="gotoStripeSetup()">
          {{ $t('payment.PaymentSetupStripeGotoSetup') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

<!-- Choose Payment Provider Dialog-->
    <md-dialog :md-active.sync="showChoosePaymentProviderDlg" :md-close-on-esc="false"
               :md-click-outside-to-close="false">
      <md-dialog-title v-bind:style="{fontSize: '28px', fontWeight: 'bold'}">{{ $t('payment.ChoosePaymentProvider') }}</md-dialog-title>
      <md-dialog-content>
        <div class="dlg-msg-2">
          {{ $t('payment.ChoosePaymentProviderMsg') }}
          <a href="mailto:contact@yogo.dk">{{ $t('payment.GetInTouch') }}</a>
        </div>
        <div class="flex">
          <div class="flex--50 pl-4 pr-4 mr-2" v-bind:style="{border: '1px solid'}">
            <div class="flex flex-wrap">
              <div v-bind:style="{ 
                fontSize: '60px', 
                fontWeight: '800', 
                fontFamily: 'system-ui', 
                margin: '20px auto 50px',
              }">
                stripe
              </div>
            </div>
            <div v-bind:style="{fontSize: '18px', fontWeight: 'bold'}">{{ $t('payment.QuickEasySetup')}}</div>            
            <div class="mt-4">
              {{ $t('global.Accept')}}
              <table class="ml-4">
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td>{{ $t('global.VisaMastercard')}}</td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td>{{ $t('global.ApplePay')}}</td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td>{{ $t('global.GooglePay')}}</td>
                </tr>              
              </table>
            </div>
            <div class="mt-4">
              {{ $t('global.Fees')}}
              <table class="ml-4">
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td v-bind:style="{fontSize: '13px'}">
                    1.4% + 1.80kr ({{ $t('global.EuropeanCards')}})
                  </td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td v-bind:style="{fontSize: '13px'}">
                    2.9% + 1.80kr ({{ $t('global.NonEuropeanCards')}})
                  </td>
                </tr>             
              </table>
            </div>
            <div class="flex">
              <md-button type="button" @click.prevent="cancelProgress()" v-bind:style="{ border: '1px solid', margin: '30px auto auto', bottom: '10px', backgroundColor: '#CFE2F3', }">
                {{ $t('payment.SelectStripe') }}
              </md-button>
            </div>
          </div>

          <div class="flex--50 pl-4 pr-4 ml-2" v-bind:style="{border: '1px solid'}">
            <div class="flex flex-wrap">
              <div v-bind:style="{ 
                fontSize: '60px', 
                fontWeight: '800', 
                fontFamily: 'system-ui', 
                margin: '20px auto 50px',
              }">
                stripe
              </div>
            </div>
            <div v-bind:style="{fontSize: '18px', fontWeight: 'bold'}">{{ $t('payment.QuickEasySetup')}}</div>            
            <div class="mt-4">
              {{ $t('global.Accept')}}
              <table class="ml-4">
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td>{{ $t('global.VisaMastercard')}}</td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td>{{ $t('global.ApplePay')}}</td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td>{{ $t('global.GooglePay')}}</td>
                </tr>              
              </table>
            </div>
            <div class="mt-4">
              {{ $t('global.Fees')}}
              <table class="ml-4">
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td v-bind:style="{fontSize: '13px'}">
                    1.4% + 1.80kr ({{ $t('global.EuropeanCards')}})
                  </td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td v-bind:style="{fontSize: '13px'}">
                    2.9% + 1.80kr ({{ $t('global.NonEuropeanCards')}})
                  </td>
                </tr>             
              </table>
            </div>
            <div class="flex">
              <md-button type="button" @click.prevent="cancelProgress()" v-bind:style="{ border: '1px solid', margin: '30px auto auto', bottom: '10px', backgroundColor: '#CFE2F3', }">
                {{ $t('payment.SelectStripe') }}
              </md-button>
            </div>
          </div>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="cancelProgress()">
          {{ $t('global.Cancel') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

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

      plan: {
        plan: 0,
      },

      countryDen: true,

      showCountryDlg: false,
      showPreStripeDlg: false,
      showChoosePaymentProviderDlg: false,
      
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
    hideAllDlg() {
      this.showCountryDlg = false;
      this.showPreStripeDlg = false;
      this.showChoosePaymentProviderDlg = false;
    },
    selectCountry() {
      this.hideAllDlg();
      if (this.plan.plan == 'pay_as_you_grow') {
        this.showPreStripeDlg = true;
        this.step = 3;
      } else {
        this.showChoosePaymentProviderDlg = true;
        this.step = 4;
      }
      console.log("countryDen: ", this.countryDen);
    },
    cancelProgress() {
      this.hideAllDlg();
      this.step = 1;
    }
  },

  watch: {
    plan: {
      handler: function (newPlan, oldPlan) {
        if ( newPlan.plan != "" && this.step == 1 ) {
          this.step = 2;
          this.showCountryDlg = true;
        }                    
      },
      deep: true,
    },
  },

};

</script>

<style lang="scss" scoped>
  .dlg-msg {
    max-width: 400px;
  }
  .dlg-msg-2 {
    max-width: 650px;
    font-size: 20px;
    margin-bottom: 30px;
  }
  li {
    list-style-type: none;
  }

  li:before {
    content: '- ';
  }
</style>
