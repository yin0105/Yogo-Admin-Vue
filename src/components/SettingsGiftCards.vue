<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.GiftCards') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else class="flex--50">

        <md-field :class="getValidationClass('form.gift_card_minimum_amount')">
          <label>{{ $t('global.MinimumAmount') }}</label>
          <md-input v-model="form.gift_card_minimum_amount" type="number" required></md-input>
          <span class="md-error" v-if="!$v.form.gift_card_minimum_amount.required">
            {{ $t('global.ThisFieldIsRequired') }}
          </span>
        </md-field>

        <md-field :class="getValidationClass('form.gift_card_valid_for_days')">
          <label>{{ $t('global.ValidForNumberOfDays') }}</label>
          <md-input v-model="form.gift_card_valid_for_days" type="number" required></md-input>
          <span class="md-error" v-if="!$v.form.gift_card_valid_for_days.required">
            {{ $t('global.ThisFieldIsRequired') }}
          </span>
        </md-field>

        <md-field>
          <label>{{ $t('global.GiftCardsAreDeliveredToTheRecipient') }}</label>
          <md-select v-model="form.gift_card_delivery_mode">
            <md-option value="auto">{{ $t('global.AutomaticallyByTheSystemAtPurchase') }}</md-option>
            <md-option value="manual">{{ $t('global.ManuallyByTheStudio') }}</md-option>
          </md-select>
        </md-field>


        <md-field v-if="form.gift_card_delivery_mode === 'auto'"
                  :class="getValidationClass('form.gift_card_recipient_email_subject')">
          <label>{{ $t('global.GiftCardEmailSubject') }}</label>
          <md-input type="text" v-model="form.gift_card_recipient_email_subject"
                    required></md-input>
          <span
              class="md-error"
              v-if="!$v.form.gift_card_recipient_email_subject.required"
          >
              {{ $t('global.ThisFieldIsRequired') }}
            </span>
        </md-field>

        <md-field v-if="form.gift_card_delivery_mode === 'auto'"
                  :class="getValidationClass('form.gift_card_recipient_email_body')">
          <label>{{ $t('global.GiftCardEmailBody') }}*</label>
          <md-textarea v-model="form.gift_card_recipient_email_body"
                       required></md-textarea>
          <span
              class="md-error"
              v-if="!$v.form.gift_card_recipient_email_body.required"
          >
              {{ $t('global.ThisFieldIsRequired') }}
            </span>
        </md-field>

        <md-field v-if="form.gift_card_delivery_mode === 'manual'"
                  :class="getValidationClass('form.gift_card_manual_delivery_admin_notification_email')">
          <label>{{ $t('global.AdminEmailForNotificationsOnGiftCardSales') }}*</label>
          <md-input type="email" v-model="form.gift_card_manual_delivery_admin_notification_email"></md-input>
          <span
              class="md-error"
              v-if="!$v.form.gift_card_manual_delivery_admin_notification_email.required"
          >
              {{ $t('global.ThisFieldIsRequired') }}
          </span>
          <span
              class="md-error"
              v-if="!$v.form.gift_card_manual_delivery_admin_notification_email.email"
          >
              {{ $t('global.notValidEmail') }}
          </span>
        </md-field>

        <div>
          <md-checkbox v-model="form.gift_card_show_in_prices">{{ $t('global.ShowGiftCardInPrices') }}</md-checkbox>
        </div>

        <md-field v-if="form.gift_card_show_in_prices && priceGroups.length">
          <label>
            {{ $t('global.ShowGiftCardInPriceGroups') }}
          </label>
          <md-select multiple v-model="form.gift_card_show_in_price_groups">
            <md-option v-for="priceGroup in priceGroups" :value="priceGroup.id">
              {{ priceGroup.name }}
            </md-option>
          </md-select>
        </md-field>

        <div v-if="form.gift_card_show_in_prices">

          <md-field :class="getValidationClass('form.gift_card_prices_title')">
            <label>{{ $t('global.TitleInPrices') }}*</label>
            <md-input type="text" v-model="form.gift_card_prices_title"></md-input>
            <span
                class="md-error"
                v-if="!$v.form.gift_card_prices_title.required"
            >
              {{ $t('global.ThisFieldIsRequired') }}
            </span>
          </md-field>

          <div class="space8"></div>
          <div class="space4"></div>
          <div>
            <imagefield :imageId.sync="form.gift_card_prices_image_id" imageFormat="square"></imagefield>
          </div>

          <md-field :class="getValidationClass('form.gift_card_prices_description')">
            <label>{{ $t('global.DescriptionInPrices') }}*</label>
            <md-textarea v-model="form.gift_card_prices_description"></md-textarea>
          </md-field>

        </div>

        <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>

      </div>

    </div>

  </div>

</template>

<script>

import SettingsSubMenu from './SettingsSubMenu';
import LoadingAnimation from './LoadingAnimation';

import YogoApi from '@/gateways/YogoApi';
import { mapActions, mapGetters } from 'vuex';
import qs from 'qs';
import Imagefield from '@/components/ImageField';

const { required, email } = require('vuelidate/lib/validators');
const settingsKeys = [
  'gift_card_minimum_amount',
  'gift_card_valid_for_days',
  'gift_card_delivery_mode',
  'gift_card_recipient_email_subject',
  'gift_card_recipient_email_body',
  'gift_card_manual_delivery_admin_notification_email',
  'gift_card_show_in_prices',
  'gift_card_show_in_price_groups',
  'gift_card_prices_description',
  'gift_card_prices_title',
  'gift_card_prices_image_id'
];

export default {
  name: 'SettingsNoShowFees',
  components: {
    Imagefield,
    LoadingAnimation,
    SettingsSubMenu,
  },
  data() {
    return {
      loading: true,
      form: {
        gift_card_delivery_mode: 'auto',
      },
    };
  },
  computed: {
    ...mapGetters([
      'client',
      'user',
    ]),
  },
  async created() {
    await Promise.all([
      this.getSettings(),
      this.getPriceGroups(),
    ]);
    this.loading = false;
  },

  methods: {

    ...mapActions([
      'updateClientSettings',
    ]),

    async getPriceGroups() {
      this.priceGroups = await YogoApi.get('/price-groups')
    },

    async getSettings() {
      const queryParams = {
        keys: settingsKeys,
      };
      const queryString = qs.stringify(queryParams);
      this.form = await YogoApi.get(
          `/clients/${this.client.id}/settings?${queryString}`,
      );
      this.form.gift_card_show_in_price_groups = JSON.parse(this.form.gift_card_show_in_price_groups);
      if (!this.form.gift_card_prices_title) {
        this.form.gift_card_prices_title = this.$t('global.GiftCard');
      }
    },

    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      this.loading = true;
      const submitData = _.pick(
          this.form,
          settingsKeys,
      );
      submitData.gift_card_show_in_price_groups = JSON.stringify(submitData.gift_card_show_in_price_groups);
      if (!submitData.gift_card_prices_image_id || isNaN(submitData.gift_card_prices_image_id)) {
        submitData.gift_card_prices_image_id = 0;
      }
      await YogoApi.put(`/clients/${this.client.id}/settings`, submitData);

      this.loading = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.SettingsHasBeenUpdated'),
      });

      await this.updateClientSettings();

    },
    getValidationClass(fieldPath) {

      const field = _.get(this.$v, fieldPath);

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },
  },

  validations() {
    const v = {
      form: {
        gift_card_minimum_amount: { required },
        gift_card_valid_for_days: { required },
      },
    };
    if (this.form.gift_card_delivery_mode === 'auto') {
      v.form.gift_card_recipient_email_subject = { required };
      v.form.gift_card_recipient_email_body = { required };
    }
    if (this.form.gift_card_delivery_mode === 'manual') {
      v.form.gift_card_manual_delivery_admin_notification_email = {
        required,
        email,
      };
    }
    if (this.form.gift_card_show_in_prices) {
      v.form.gift_card_prices_title = {
        required,
      };
    }
    return v;
  },
};

</script>
