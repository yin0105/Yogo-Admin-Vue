<template>
  <div>
    <loading-animation v-if="loading"></loading-animation>
    <div v-else>
      <div class="flex__2-1--container">
        <h2>{{ giftCardFormTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'GiftCards' }">{{ $t('global.Back') }}</router-link>
      </md-button>
      <div class="space4"></div>

      <div class="flex--row">

        <md-field :class="getValidationClass('giver_name')" class="flex--50">
          <label>{{ $t('global.GiverName') }}</label>
          <md-input v-model="form.giver_name" type="text"></md-input>
          <span class="md-error"
                v-if="!$v.form.giver_name.required">{{ $t('global.ThisFieldIsRequired') }}</span>
        </md-field>

        <md-field :class="getValidationClass('giver_email')" class="flex--50">
          <label>{{ $t('global.GiverEmail') }}</label>
          <md-input v-model="form.giver_email" type="text"></md-input>
          <span class="md-error"
                v-if="!$v.form.giver_email.required">{{ $t('global.ThisFieldIsRequired') }}</span>
          <span class="md-error"
                v-if="!$v.form.giver_email.email">{{ $t('global.notValidEmail') }}</span>
        </md-field>
      </div>

      <div class="flex--row">

        <md-field :class="getValidationClass('recipient_name')" class="flex--50">
          <label>{{ $t('global.RecipientName') }}</label>
          <md-input v-model="form.recipient_name" type="text"></md-input>
          <span class="md-error"
                v-if="!$v.form.recipient_name.required">{{ $t('global.ThisFieldIsRequired') }}</span>
        </md-field>

        <md-field :class="getValidationClass('recipient_email')" class="flex--50">
          <label>{{ $t('global.RecipientEmail') }}</label>
          <md-input v-model="form.recipient_email" type="text"></md-input>
          <span class="md-error"
                v-if="!$v.form.recipient_email.required">{{ $t('global.ThisFieldIsRequired') }}</span>
          <span class="md-error"
                v-if="!$v.form.recipient_email.email">{{ $t('global.notValidEmail') }}</span>
        </md-field>
      </div>


      <div class="flex--row">

        <md-field class="flex--50" :class="getValidationClass('amount')">
          <label>{{ $t('global.Amount') }}</label>
          <md-input type="number" v-model="form.amount" min="1"></md-input>
          <span class="md-error"
                v-if="!$v.form.amount.required">{{ $t('global.ThisFieldIsRequired') }}</span>
          <span class="md-error"
                v-if="!$v.form.amount.minValue">{{ $t('global.MustBeAtLeastOne') }}</span>
        </md-field>

        <md-field class="flex--50"
                  :class="getValidationClass('amount_left')">
          <label>{{ $t('global.AmountLeft') }}</label>
          <md-input type="number" v-model="form.amount_left" min="1"></md-input>
          <span class="md-error"
                v-if="!$v.form.amount_left.required">{{ $t('global.ThisFieldIsRequired') }}</span>
          <span class="md-error"
                v-if="!$v.form.amount_left.minValue">{{ $t('global.MustBeAtLeastOne') }}</span>
        </md-field>

      </div>

      <div class="flex--row">

        <md-field class="flex--50">
          <label>{{ $t('global.Message') }}</label>
          <md-textarea v-model="form.message"></md-textarea>
        </md-field>

        <div class="flex--50" :class="getValidationClass('valid_until')">
          <label>{{ $t('global.ValidUntil') }}</label>
          <md-datepicker
              v-model="form.valid_until"
              class="not-clearable"
              :class="getValidationClass('valid_until')"
          >
          </md-datepicker>
          <span class="md-error"
          v-if="!$v.form.valid_until.sameOrAfterToday">{{ $t('global.MustBeTodayOrLater') }}</span>
        </div>


      </div>

    </div>

    <div class="space8"></div>

    <div class="flex">
      <md-button class="md-raised md-primary" @click="submit">{{ saveLabel }}</md-button>
      <md-button class="md-raised md-primary red" v-if="formType === 'edit'" @click="deleteGiftCard">
        {{ $t('global.Delete') }}
      </md-button>
      <md-checkbox v-if="formType === 'add' && client.settings.gift_card_delivery_mode === 'auto'" v-model="sendToRecipientNow">{{ $t('global.SendToRecipientNow') }}</md-checkbox>
    </div>


    <div class="space8"></div>

  </div>

</template>

<script>
import LoadingAnimation from './LoadingAnimation.vue';
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';
import TooltipInfo from './TooltipInfo';
import moment from 'moment-timezone'

const { required, minValue, email } = require('vuelidate/lib/validators');

export default {
  components: {
    LoadingAnimation,
    TooltipInfo,
  },
  data() {
    return {
      giftCardFormTitle: this.$route.meta.formType === 'edit' ? this.$t('global.EditGiftCard') : this.$t('global.CreateGiftCard'),

      saveLabel: this.$route.meta.formType === 'edit' ? this.$t('global.Update') : this.$t('global.Create'),
      loading: true,

      form: {
        giver_name: '',
        giver_email: '',
        recipient_name: '',
        recipient_email: '',
        amount: 0,
        amount_left: 0,
        valid_until: moment.tz('Europe/Copenhagen')
            .add(1, 'year')
            .toDate(),
        message: '',
      },

      sendToRecipientNow: false,

    };
  },
  computed: {
    ...mapGetters([
      'stateReady',
        'client'
    ]),
    formType() {
      return this.$route.meta.formType;
    },
  },
  async created() {
    if (this.formType === 'edit' && this.stateReady) {
      this.fetchGiftCard();
    } else {
      this.loading = false;
    }
  },
  watch: {
    stateReady(newReadyState) {
      if (this.formType === 'edit' && newReadyState) this.fetchGiftCard();
    },
  },
  methods: {

    async fetchGiftCard() {
      this.form = await YogoApi.get(`/gift-cards/${this.$route.params.id}`);
      this.form.valid_until = moment(this.form.valid_until).toDate();
      this.loading = false;
    },

    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      const giftCardData = _.pick(this.form, [
        'giver_name',
        'giver_email',
        'recipient_name',
        'recipient_email',
        'amount',
        'amount_left',
        'message',
      ]);

      giftCardData.valid_until = moment(this.form.valid_until).format('YYYY-MM-DD');

      switch (this.formType) {
        case 'add':
          giftCardData.sendToRecipientNow = this.sendToRecipientNow;

          await YogoApi.post('/gift-cards', giftCardData);
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.$t('global.GiftCardHasBeenCreated'),
          });
          break;

        case 'edit':
          await YogoApi.put(`/gift-cards/${this.$route.params.id}`, giftCardData);
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.$t('global.GiftCardHasBeenUpdated'),
          });
          break;
      }
      this.$router.push({ name: 'GiftCards' });
    },


    getValidationClass(fieldName) {

      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },


    async deleteGiftCard() {
      if (!confirm(this.$t('global.DoYouWantToDeleteThisGiftCard'))) return;

      await YogoApi.delete('/gift-cards/' + this.$route.params.id);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.GiftCardHasBeenDeleted'),
      });
      this.$router.push({ name: 'GiftCards' });

    },
  },
  validations: {
    form: {
      giver_name: { required },
      giver_email: {
        required,
        email,
      },
      recipient_name: { required },
      recipient_email: {
        required,
        email,
      },
      amount: {
        required,
        minValue: minValue(1),
      },
      amount_left: {
        required,
        minValue: minValue(1),
      },
      valid_until: {
        sameOrAfterToday: (value) => {
          return moment(value).tz('Europe/Copenhagen')
              .isSameOrAfter(moment.tz('Europe/Copenhagen'), 'day');
        }
      },
    },
  },

};
</script>

