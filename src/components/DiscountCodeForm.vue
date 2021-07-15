<template>
  <div>
    <loading-animation v-if="loading"></loading-animation>
    <div v-else>
      <div class="flex__2-1--container">
        <h2>{{ discountCodeFormTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'DiscountCodes' }">{{ $t('global.Back') }}</router-link>
      </md-button>
      <div class="space4"></div>

      <div class="flex--row">

        <md-field :class="getValidationClass('name')" class="flex--50">
          <label>{{ $t('global.Code') }}</label>
          <md-input v-model="form.name" type="text"></md-input>
          <span class="md-helper-text">{{ $t('global.NoDifferenceBestweenUpperCase') }}</span>
          <span class="md-error"
                v-if="!$v.form.name.required">{{ $t('global.PromotionCodeNameMust') }}</span>
        </md-field>
      </div>

      <div class="flex--row">


        <md-field class="flex--50">
          <label>{{ $t('global.Type') }}</label>
          <md-select v-model="form.type">
            <md-option value="discount_percent">{{ $t('global.DiscountPercent') }}</md-option>
            <md-option value="discount_amount">{{ $t('global.DiscountAmount') }}</md-option>
            <!--<md-option value="membership_campaign">{{ membershipCampaignLabel }}</md-option>-->
          </md-select>
        </md-field>

        <md-field v-if="form.type === 'discount_percent'"
                  :class="getValidationClass('discount_percent')" class="flex--50">
          <label>{{ $t('global.DiscountPercent') }}</label>
          <md-input type="number" v-model="form.discount_percent" min="1" max="100"></md-input>
          <span class="md-helper-text">{{ $t('global.HundredPercentEqualFreeDesc') }}</span>
          <span class="md-error"
                v-if="!$v.form.discount_percent.required">{{ $t('global.MustBe') }}</span>
          <span class="md-error"
                v-if="!$v.form.discount_percent.between">{{ $t('global.HasToBeBetweenOneAndHundred') }}</span>
        </md-field>

        <md-field v-if="form.type === 'discount_amount'"
                  :class="getValidationClass('discount_amount')" class="flex--50">
          <label>{{ $t('global.DiscountAmount') }}</label>
          <md-input type="number" v-model="form.discount_amount" min="1"></md-input>
          <span
              class="md-error"
              v-if="!$v.form.discount_amount.required"
          >
            {{ $t('global.MustBe') }}
          </span>
        </md-field>

      </div>


      <div class="space4"></div>

      <div class="flex--row">
        <div class="flex--50 yogo-field" :class="getValidationClass('valid_for_items')">
          <div class="looks-like-md-label">{{ $t('global.AppliesTo') }}</div>
          <div class="flex">
            <Treeselect
                v-model="form.valid_for_items"
                :multiple="true"
                :options="treeSelectOptions"
                :clearable="false"
            />
            <span
                class="md-error"
                v-if="!$v.form.valid_for_items.required || !$v.form.valid_for_items.minLength"
            >
                {{ $t('global.PleaseChooseWhatPromotionCodeAppliesTo') }}
              </span>

            <TooltipInfo :tooltipText="$t('global.IfMembershipDiscountCode')"></TooltipInfo>
          </div>
        </div>
      </div>

      <div class="space8"></div>

      <div class="flex--row">
        <div class="flex--50">
          <div>
            <md-checkbox v-model="form.has_use_per_customer_limit">
              {{ $t('global.CanBeUsedMaxTimesPerCustomer') }}
            </md-checkbox>
          </div>


          <md-field v-if="form.has_use_per_customer_limit"
                    :class="getValidationClass('form.use_per_customer_limit')">
            <label>{{ $t('global.MaxTimesPerCustomer') }}</label>
            <md-input type="number" v-model="form.use_per_customer_limit"></md-input>
            <span class="md-error" v-if="!$v.form.use_per_customer_limit.required">{{
                $t('global.MustBeAtLeastOne')
              }}</span>
            <span class="md-error" v-if="!$v.form.use_per_customer_limit.minValue">{{
                $t('global.MustBeAtLeastOne')
              }}</span>
          </md-field>
        </div>

        <div class="flex--50">
          <div>
            <md-checkbox v-model="form.has_customer_limit">
              {{ $t('global.CanBeUsedByMaxAmountOfCustomers') }}
            </md-checkbox>
          </div>


          <md-field v-if="form.has_customer_limit"
                    :class="getValidationClass('form.customer_limit')">
            <label>{{ $t('global.MaxCustomers') }}</label>
            <md-input type="number" v-model="form.customer_limit"></md-input>
            <span class="md-error"
                  v-if="!$v.form.customer_limit.required">{{ $t('global.MustBeAtLeastOne') }}</span>
          </md-field>
        </div>
      </div>

      <div class="space4"></div>


      <md-checkbox v-model="form.active">
        {{ $t('global.CanBeUsedNow') }}
      </md-checkbox>

    </div>

    <div class="space8"></div>

    <md-button class="md-raised md-primary" @click="submit">{{ saveLabel }}</md-button>
    <md-button class="md-raised md-primary red" v-if="formType === 'edit'" @click="deleteDiscountCode">
      {{ $t('global.Delete') }}
    </md-button>

    <div class="space8"></div>

  </div>

</template>

<script>
import LoadingAnimation from './LoadingAnimation.vue';
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

import MembershipCampaignFormRow from './MembershipCampaignFormRow';
import TooltipInfo from './TooltipInfo';

const {
  required,
  integer,
  minLength,
  between,
  minValue,
} = require('vuelidate/lib/validators');

export default {
  components: {
    LoadingAnimation,
    Treeselect,
    MembershipCampaignFormRow,
    TooltipInfo,
  },
  data() {
    return {
      discountCodeFormTitle: this.$route.meta.formType === 'edit' ? this.$t('global.EditPromotionCode') : this.$t('global.CreatePromotionCode'),

      saveLabel: this.$route.meta.formType === 'edit' ? this.$t('global.Update') : this.$t('global.Create'),
      loading: true,

      form: {
        name: '',
        type: 'discount_percent',
        discount_percent: 0,
        discount_amount: 0,
        valid_for_items: [],
        has_use_per_customer_limit: true,
        use_per_customer_limit: 1,
        has_customer_limit: false,
        customer_limit: 100,
        active: true,
      },

      classPassTypes: [],
      membershipTypes: [],
      events: [],
      products: [],
    };
  },
  computed: {
    ...mapGetters([
      'stateReady',
    ]),
    formType() {
      return this.$route.meta.formType;
    },
    treeSelectOptions() {
      const options = [
        {
          id: 'membership_types',
          label: this.$t('global.AllMemberships'),
          children: _.sortBy(
              _.map(this.membershipTypes, membershipType => {
                return {
                  id: 'membership_type_' + membershipType.id,
                  label: membershipType.name,
                };
              }),
              'label',
          ),
        },
      ];

      if (this.form.type !== 'membership_campaign') {
        options.push({
          id: 'class_pass_types',
          label: this.$t('global.AllClassPasses'),
          children: _.map(this.classPassTypes, classPassType => {
            return {
              id: 'class_pass_type_' + classPassType.id,
              label: classPassType.name,
            };
          }),
        });
        options.push(
            {
              id: 'events',
              label: this.$t('global.AllEvents'),
              children: _.map(this.events, event => {
                return {
                  id: 'event_' + event.id,
                  label: event.name,
                };
              }),
            },
        );
        options.push(
            {
              id: 'products',
              label: this.$t('global.AllProducts'),
              children: _.map(this.products, product => {
                return {
                  id: 'product_' + product.id,
                  label: product.name,
                };
              }),
            },
        );
      }

      return options;

    },
  },
  async created() {
    await this.fetchItems();
    if (this.formType === 'edit' && this.stateReady) {
      this.fetchDiscountCode();
    } else {
      this.loading = false;
    }
  },
  watch: {
    stateReady(newReadyState) {
      if (this.formType === 'edit' && newReadyState) this.fetchDiscountCode();
    },
  },
  methods: {
    async fetchItems() {
      [this.classPassTypes, this.membershipTypes, this.events, this.products] = await Promise.all([
        YogoApi.get('/class-pass-types'),
        YogoApi.get('/membership-types'),
        YogoApi.get('/events'),
        YogoApi.get('/products'),
      ]);
    },

    async fetchDiscountCode() {
      this.form = (await YogoApi.get('/discount-codes?id=' + this.$route.params.id))[0];
      this.loading = false;
    },


    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      const discountCodeData = _.pick(this.form, [
        'name',
        'type',
        'discount_percent',
        'discount_amount',
        'valid_for_items',
        'has_use_per_customer_limit',
        'use_per_customer_limit',
        'has_customer_limit',
        'customer_limit',
        'active',
      ]);

      switch (this.formType) {
        case 'add':
          await YogoApi.post('/discount-codes', discountCodeData);
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + this.$t('global.isCreated'),
          });
          break;

        case 'edit':
          await YogoApi.put('/discount-codes/' + this.$route.params.id, discountCodeData);
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + this.$t('global.hasBeenUpdated'),
          });
      }
      this.$router.push({ name: 'DiscountCodes' });
    },


    getValidationClass(fieldName) {

      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },


    async deleteDiscountCode() {
      if (!confirm(this.$t('global.DoYouWantToDelete') + this.form.name + this.$t('global.IfPromotionMembershipsActiveStillValidDesc'))) return;

      await YogoApi.delete('/discount-codes/' + this.$route.params.id);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.form.name + this.$t('global.isDeleted'),
      });
      this.$router.push({ name: 'DiscountCodes' });

    },
  },
  validations() {
    let v = {
      form: {
        name: {
          required,
        },
        valid_for_items: {
          required,
          minLength: minLength(1),
        },
      },
    };

    if (this.form.type === 'discount_percent') {
      v.form.discount_percent = {
        required,
        integer,
        between: between(1, 100),
      };
    }

    if (this.form.type === 'discount_amount') {
      v.form.discount_amount = {
        required,
        minValue: minValue(1),
      };
    }

    /*if (this.form.type === 'membership_campaign') {
      v.form.membership_campaign = {
        name: {
          required,
        },
        number_of_months_at_reduced_price: {
          required,
        },
        reduced_price: {
          required,
        },
        min_number_of_months_since_customer_last_had_membership_type: {
          required,
        },
      }
    }*/

    if (this.form.has_customer_limit) {
      v.form.customer_limit = {
        required,
        minValue: minValue(1),
      };
    }

    if (this.form.has_use_per_customer_limit) {
      v.form.use_per_customer_limit = {
        required,
        minValue: minValue(1),
      };
    }

    return v;
  },
};
</script>

