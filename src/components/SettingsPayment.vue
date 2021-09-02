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
        <div v-else>
          <div v-if="form.payment_service_provider == 'reepay_onboarding'">
            {{ $t('payment.ReepayOnboardingMsg') }}
          </div>
          
          <div v-if="form.payment_service_provider == 'stripe_onboarding'" class="flex flex-col">
            <div>{{ $t('payment.StripeOnboardingMsg1') }}</div>
            <div v-bind:style="{ 
              fontSize: '85px', 
              fontWeight: '800', 
              fontFamily: 'system-ui', 
              margin: '30px 0px 60px',
              color: '#625AFE',
            }">
              stripe
            </div>
            <div>{{ $t('payment.StripeOnboardingMsg2') }}</div>
            <div class="mt-4">
              <md-button type="button" @click.prevent="" class="btn-select-payment">
                {{ $t('payment.CompleteStripeSetup') }}
              </md-button>
            </div>
          </div>

          <div v-if="form.payment_service_provider == 'stripe'" class="flex flex-col">
            <div>{{ $t('payment.StripeOnboardingMsg1') }}</div>
            <div v-bind:style="{ 
              fontSize: '85px', 
              fontWeight: '800', 
              fontFamily: 'system-ui', 
              margin: '30px 0px 30px',
              color: '#625AFE',
            }">
              stripe
            </div>
            <div class="mt-4">
              <md-button type="button" @click.prevent="" class="btn-select-payment">
                {{ $t('payment.OpenStripeDashboard') }}
              </md-button>
            </div>
          </div>
          
          <div v-if="form.payment_service_provider == 'reepay'" class="flex--50">

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
        <md-button v-if="countryDen" type="button" @click.prevent="selectStripe()">
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
        <div class="flex" v-bind:style="{maxWidth: '700px'}">
          <div class="flex--50 flex flex-col" v-bind:style="{border: '1px solid'}">
            <div class=" pl-4 pr-4 mr-2">
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
            </div>
            <div class="flex" style="margin-top: auto;">
              <md-button type="button" @click.prevent="selectStripe()"  class="btn-select-payment">
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
                reepay
              </div>
            </div>
            <div v-bind:style="{fontSize: '18px', fontWeight: 'bold'}">{{ $t('payment.LowerFees')}}</div>            
            <div class="mt-4">
              {{ $t('global.Accept')}}
              <table class="ml-4">
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td>{{ $t('global.VisaMastercard')}}</td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td>Dankort</td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td>MobilePay</td>
                </tr>              
              </table>
            </div>
            <div class="mt-4">
              {{ $t('global.Fees')}}
              <table class="ml-4">
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td v-bind:style="{fontSize: '13px'}">
                    139 kr/md
                  </td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td v-bind:style="{fontSize: '13px'}">
                    1.1% ({{ $t('global.EuropeanCards')}})
                  </td>
                </tr>
                <tr>
                  <td v-bind:style="{width: '30px'}">-</td>
                  <td v-bind:style="{fontSize: '13px'}">
                    2.75% ({{ $t('global.NonEuropeanCards')}})
                  </td>
                </tr>             
              </table>
            </div>
            <div class="flex">
              <md-button type="button" @click.prevent="selectReepay()" class="btn-select-payment">
                {{ $t('payment.SelectReepay') }}
              </md-button>
            </div>
          </div>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="cancelProgress()" class="btn-select-payment" v-bind:style="{marginRight: '20px'}">
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
      step: 'init',

      plan: {
        plan: '',
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
    this.loading = true;
    this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings' +
        '?keys[]=payment_show_visa_mastercard_logos' +
        '&keys[]=payment_show_dankort_logo' +
        '&keys[]=payment_show_mobilepay_logo' +
        '&keys[]=payment_service_provider_reepay_webhook_secret' +
        '&keys[]=payment_service_provider_reepay_private_api_key' +
        '&keys[]=plan' +
        '&keys[]=payment_service_provider' +
        '&keys[]=payment_service_provider_stripe_account_id',        
    );
    this.loading = false;
  },
  async mounted() {
    if (this.$route.query.type) {
      console.log("type=", this.$route.query.type)
      if (this.$route.query.type == "refresh") {
        this.loading = true;
        await this.stripeOnboarding();
        this.loading = false;
      } else if (this.$route.query.type == "return") {
        this.loading = true;
        await this.stripeOnboardingCheck();
        this.loading = false;
      }
    }
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
        this.step = 'setup_with_stripe';
      } else {
        this.showChoosePaymentProviderDlg = true;
        this.step = 'choose_payment_provider';
      }
      console.log("countryDen: ", this.countryDen);
    },
    cancelProgress() {
      this.hideAllDlg();
      this.step = 'init';
    }, 

// Stripe Onboarding
    async selectStripe() {
      this.hideAllDlg();
      this.loading = true;
      await YogoApi.put('/clients/' + this.client.id + '/settings', { plan: this.plan.plan, payment_service_provider: 'stripe_onboarding'});     
      await this.stripeOnboarding();
      this.loading = false;
      this.step = 'stripe_onboarding';
    },
    async stripeOnboarding() {
        this.loading = true;
        const host = window.location.protocol + "//" + window.location.host;
        const params = new URLSearchParams();
        params.append('host', host);
        const res = await YogoApi.post('/payments/stripe/onboarding', {host: host});
      
        if (res.error) {
            console.log("error = ", res.error)
        } else {
            console.log("account_id = ", res.account_id)
            await YogoApi.put('/clients/' + this.client.id + '/settings', { payment_service_provider_stripe_account_id: res.account_id});     
            window.location.href = res.url;
        }

        this.loading = false;
        this.step = 'stripe_onboarding';
    },
    async stripeOnboardingCheck() {
      this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings' +
        '?keys[]=payment_show_visa_mastercard_logos' +
        '&keys[]=payment_show_dankort_logo' +
        '&keys[]=payment_show_mobilepay_logo' +
        '&keys[]=payment_service_provider_reepay_webhook_secret' +
        '&keys[]=payment_service_provider_reepay_private_api_key' +
        '&keys[]=plan' +
        '&keys[]=payment_service_provider' +
        '&keys[]=payment_service_provider_stripe_account_id',        
      );
      console.log("accountId = ", this.form.payment_service_provider_stripe_account_id)
      const res_2 = await YogoApi.get(`/payments/stripe/onboarding-check?accountId=${this.form.payment_service_provider_stripe_account_id}`);
      console.log('res_2 = ', res_2)
      if (res_2) {
        await YogoApi.put('/clients/' + this.client.id + '/settings', { payment_service_provider: 'stripe'});     
      }
      // this.$router.push('SettingsPayment');
    },

// Reepay Onboarding
    async selectReepay() {
      this.hideAllDlg();
      this.loading = true;

      await YogoApi.put('/clients/' + this.client.id + '/settings', { plan: this.plan.plan, payment_service_provider: 'reepay_onboarding'});
      await YogoApi.get('/payments/reepay/send-onboarding-email/' + this.client.id);
      
      this.loading = false;
      this.step = 'reepay_onboarding';
    },
  },

  watch: {
    plan: {
      handler: function (newPlan, oldPlan) {
        // if ( newPlan.plan != "" && this.step == 'init' ) {
        if ( newPlan.plan != "") {
          this.step = 'select_country';
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
    max-width: 680px;
    font-size: 20px;
    margin-bottom: 30px;
  }
  li {
    list-style-type: none;
  }

  li:before {
    content: '- ';
  }

  .btn-select-payment {
    border: 1px solid !important;
    margin: 30px auto auto;
    padding: 10px 30px;
    bottom: 10px;
    background-color: #CFE2F3;
  }
</style>
