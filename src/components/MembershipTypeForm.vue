<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ pageTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'Prices' }">{{ $t('global.Back') }}</router-link>
      </md-button>

      <div class="space4"></div>

      <div class="flex--row">
        <div class="flex--50">

          <div class="space8"></div>

          <imagefield :imageId.sync="form.image_id" :imageFormat="'square'"
                      class="flex--50 file--square flex__align--start"></imagefield>

          <md-field :class="getValidationClass('form.name')">
            <label>{{ $t('global.Name') }}</label>
            <md-input v-model="form.name" type="text" required></md-input>
            <span class="md-error" v-if="!$v.form.name.required">{{ $t('global.NameMust') }}</span>
          </md-field>

          <md-field>
            <label>{{ $t('global.Description') }}</label>
            <md-textarea v-model="form.description"></md-textarea>
          </md-field>

        </div>
      </div>

      <div class="flex--row">

        <div class="flex--50">
          <h3>
            {{
              client.settings.livestream_enabled ? $t('global.AppliesToClassTypesStudio') : $t('global.AppliesToClassTypes')
            }}
          </h3>
          <!--<Treeselect
              v-model="form.class_types"
              :multiple="true"
              :options="treeSelectClassTypesOptions"
              :clearable="false"
              :defaultExpandLevel="1"
              value-consists-of="LEAF_PRIORITY"
              :no-options-text="$t('global.NoClassTypesCreatedYet')"
          />-->
          <YogoTreeselectClassTypes v-model="form.class_types"></YogoTreeselectClassTypes>
        </div>

        <div class="flex--50" v-if="client.settings.livestream_enabled">
          <h3>
            {{ $t('global.AppliesToClassTypesLivestream') }}
          </h3>
          <!--<Treeselect
              v-model="form.class_types_livestream"
              :multiple="true"
              :options="treeSelectClassTypesOptions"
              :clearable="false"
              :defaultExpandLevel="1"
              value-consists-of="LEAF_PRIORITY"
              :no-options-text="$t('global.NoClassTypesCreatedYet')"
          />-->
          <YogoTreeselectClassTypes v-model="form.class_types_livestream"></YogoTreeselectClassTypes>
        </div>
      </div>

      <div class="flex--row">

        <div class="flex--50" v-if="client.extended_video_enabled">
          <md-checkbox v-model="form.access_all_videos">{{ $t('global.GivesAccessToAllVideos') }}</md-checkbox>
        </div>

        <div class="flex--50">
          <h3>
            {{ $t('global.AppliesToVideoGroups') }}
          </h3>
          <!--<Treeselect
              v-model="form.video_groups"
              :multiple="true"
              :options="treeSelectVideoGroupsOptions"
              :clearable="false"
              :defaultExpandLevel="1"
              value-consists-of="LEAF_PRIORITY"
              :no-options-text="$t('global.NoVideoGroupsYet')"
          />-->
          <YogoTreeselectVideoGroups v-model="form.video_groups"></YogoTreeselectVideoGroups>
        </div>

      </div>


      <div class="flex--row">

        <div class="flex--50">

          <div class="space8"></div>

          <md-checkbox v-model="form.has_max_number_of_simultaneous_bookings">
            {{
              client.settings.livestream_enabled ? $t('global.MaxNumberOfSimultaneousStudioBookings') : $t('global.MaxNumberOfSimultaneousBookings')
            }}
          </md-checkbox>

          <md-field v-if="form.has_max_number_of_simultaneous_bookings"
                    :class="getValidationClass('form.max_number_of_simultaneous_bookings')">
            <label>{{
                client.settings.livestream_enabled ? $t('global.MaxNumberOfSimultaneousStudioBookings') : $t('global.MaxNumberOfSimultaneousBookings')
              }}</label>
            <md-input type="number" v-model="form.max_number_of_simultaneous_bookings"></md-input>
            <span class="md-error"
                  v-if="!$v.form.max_number_of_simultaneous_bookings.required">{{
                $t('global.MustBeAtLeastOne')
              }}</span>
            <span class="md-error"
                  v-if="!$v.form.max_number_of_simultaneous_bookings.minValue">{{
                $t('global.MustBeAtLeastOne')
              }}</span>
          </md-field>

          <div class="space4"></div>

          <md-checkbox v-model="form.has_max_number_of_classes_per_week">
            {{ $t('global.MaxNumberOfClassesPerWeek') }}
          </md-checkbox>

          <md-field v-if="form.has_max_number_of_classes_per_week"
                    :class="getValidationClass('form.max_number_of_classes_per_week')">
            <label>{{ $t('global.MaxNumberOfClassesPerWeek') }}</label>
            <md-input type="number" v-model="form.max_number_of_classes_per_week"></md-input>
            <span class="md-error"
                  v-if="!$v.form.max_number_of_classes_per_week.required">{{ $t('global.MustBeAtLeastOne') }}</span>
            <span class="md-error"
                  v-if="!$v.form.max_number_of_classes_per_week.minValue">{{ $t('global.MustBeAtLeastOne') }}</span>
          </md-field>

          <div class="space4"></div>

          <h3>
            {{ $t('global.ShowInPriceGroups') }}
          </h3>
          <!--<Treeselect
              v-model="form.price_groups"
              :multiple="true"
              :options="treeSelectPriceGroupsOptions"
              :clearable="false"
              :defaultExpandLevel="1"
              value-consists-of="LEAF_PRIORITY"
              :no-options-text="$t('global.NoPriceGroupsCreatedYet')"
          />-->
          <YogoTreeselectPriceGroups v-model="form.price_groups"></YogoTreeselectPriceGroups>

          <div class="space8"></div>

          <md-checkbox v-model="form.send_email_to_customer">
            {{ $t('global.SendEmailToCustomer') }}
          </md-checkbox>

          <md-field :class="getValidationClass('form.email_subject')"
                    v-if="form.send_email_to_customer">
            <label>{{ $t('global.EmailSubject') }}</label>
            <md-input v-model="form.email_subject" type="text" required></md-input>
            <span class="md-error"
                  v-if="!$v.form.email_subject.required">{{ $t('global.SubjectMust') }}</span>
          </md-field>

          <md-field :class="getValidationClass('form.email_body')"
                    v-if="form.send_email_to_customer">
            <label>{{ $t('global.EmailText') }}</label>
            <md-textarea v-model="form.email_body" required></md-textarea>
            <span class="md-error"
                  v-if="!$v.form.email_subject.required">{{ $t('global.EmailTextMust') }}</span>
          </md-field>
          <div v-if="form.send_email_to_customer">
            {{ $t('global.FollowingCodesCanBeUsed') }} [customer_first_name], [customer_last_name],
            [membership_name], [studio_name],
            [membership_paid_until_date], [membership_renewal_date], [membership_payment_amount],
            [membership_edit_link]
          </div>


          <div class="space8"></div>

          <md-checkbox v-model="form.has_max_number_of_memberships">
            {{ $t('global.HasMaxNumberOfMemberships') }}
          </md-checkbox>

          <md-field :class="getValidationClass('form.max_number_of_memberships')"
                    v-if="form.has_max_number_of_memberships">
            <label>{{ $t('global.MaxNumberOfMemberships') }}</label>
            <md-input v-model="form.max_number_of_memberships" type="number" required></md-input>
            <span class="md-error" v-if="!$v.form.max_number_of_memberships.required">{{
                $t('global.MaxNumberOfMembershipsMust')
              }}</span>
          </md-field>


        </div>
      </div>

      <h4>{{ $t('global.PaymentOptions') }}</h4>

      <div class="flex--50">
        <md-button class="md-fab turkis md-mini md-primary" @click="addPaymentOption">
          <md-icon>add</md-icon>
          <md-tooltip md-direction="right">{{ $t('global.CreatePaymentOption') }}</md-tooltip>
        </md-button>

      </div>


      <div class="flex--row payment-option-row" v-for="(paymentOption, idx) in paymentOptions"
           :key="idx">

        <div class="flex--row flex--100">

          <md-field class="flex--50"
                    :class="getValidationClass(['paymentOptions','$each', idx, 'name'])">
            <label>{{ $t('global.PaymentOptionName') }}</label>
            <md-input v-model="paymentOption.name" type="text" required></md-input>
            <span class="md-error"
                  v-if="!$v.paymentOptions.$each[idx].name.required">{{ $t('global.NameMust') }}</span>
          </md-field>

          <div class="flex--35 flex--row">
            <md-field class="flex--50"
                      :class="getValidationClass(['paymentOptions','$each', idx, 'number_of_months_payment_covers'])">
              <label>{{ $t('global.Months') }}</label>
              <md-input v-model="paymentOption.number_of_months_payment_covers" type="number"
                        required
                        v-if="!paymentOption.membershipCount"></md-input>
              <md-input v-model="paymentOption.number_of_months_payment_covers" type="number"
                        disabled required
                        v-else></md-input>
              <span class="md-error"
                    v-if="!$v.paymentOptions.$each[idx].number_of_months_payment_covers.required">{{
                  $t('global.MustBe')
                }}</span>
              <span class="md-error"
                    v-else-if="!$v.paymentOptions.$each[idx].number_of_months_payment_covers.minValue">{{
                  $t('global.AtLeastOne')
                }}</span>
              <span class="md-error"
                    v-else-if="!$v.paymentOptions.$each[idx].number_of_months_payment_covers.maxValue">{{
                  $t('global.MaxSixty')
                }}</span>
            </md-field>

            <md-field class="flex--50"
                      :class="getValidationClass(['paymentOptions','$each', idx, 'payment_amount'])">
              <label>{{ $t('global.Price') }}</label>
              <md-input v-model="paymentOption.payment_amount" type="number" required></md-input>
              <span class="md-error"
                    v-if="!$v.paymentOptions.$each[idx].payment_amount.required || !$v.paymentOptions.$each[idx].payment_amount.minValue">{{
                  $t('global.MustBe')
                }}</span>
            </md-field>

          </div>

          <div class="flex--15">
            <md-checkbox v-model="paymentOption.for_sale">
              {{ $t('global.ForSale') }}
            </md-checkbox>
          </div>

        </div>

        <div class="flex-15">

          <md-button class="md-icon-button md-mini delete-payment-option-button"
                     v-if="paymentOption.membershipCount">
            <md-icon>face</md-icon>
            <md-tooltip md-direction="top">{{ paymentOption.membershipCount }}
              {{
                paymentOption.membershipCount > 1 ?
                    $t('global.NumberMembershipTypesPlural') : $t('global.NumberMembershipTypes')
              }}
            </md-tooltip>
          </md-button>

          <md-button class="md-icon-button md-mini delete-payment-option-button"
                     @click="deletePaymentOption(idx)" v-else>
            <md-icon>delete</md-icon>
          </md-button>

        </div>


        <div class="space8"></div>
        <div class="space8"></div>

      </div>

      <div class="space4"></div>
      <md-checkbox v-model="hasActiveCampaign">{{ $t('global.CampaignActive') }}</md-checkbox>

      <MembershipCampaignFormRow v-model="form.active_campaign" :$v="$v.form.active_campaign"
                                 v-if="form.active_campaign"></MembershipCampaignFormRow>

      <div class="space8"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ saveLabel }}</md-button>
      <md-button class="md-raised md-primary red" v-if="showDeleteMembershipTypeButton" @click="destroy">
        {{ $t('global.Delete') }}
      </md-button>
      <div class="space8"></div>

      <div class="space8"></div>

      <div v-if="formType === 'edit' && originalMembershipType">
        <h3>{{ $t('global.Memberships') }} ({{ originalMembershipType.memberships.length }})</h3>
        <p>
          {{ activeMembershipCount }} {{ $t('global.active') }}<br>
          {{ activeNoPaymentOptionMembershipCount }} {{ $t('global.withoutPaymentCard') }} ({{
            missingPaymentOptionAndPaymentDatePassed
          }} {{ $t('global.hasExceededPaymentDate') }}<br>
          {{ cancelledRunningMembershipCount }} {{ $t('global.stoppedAndGoesUntil') }}<br>
          {{ renewalDeclinedMembershipCount }} {{ $t('global.autoRenewalFailed') }}
        </p>

        <md-button
            type="button"
            v-if="selectedMemberships.length"
            @click.prevent="showExportMembershipEmailsDialog = true"
            class="md-raised md-primary"
        >
          {{ $t('global.ExportNEmails', { N: selectedMemberships.length }) }}
        </md-button>

        <YogoTable
            :cols="membershipsTableCols"
            :rows="originalMembershipType.memberships"
            :pageSize="50"
            selectable="multiple"
            @selected="onMembershipSelect"
        >
          <template v-slot:default="slotProps">
            <YogoTd>
              <a @click="$router.push({name: 'CustomerInfo', params: {id: slotProps.item.user.id}})">{{
                  slotProps.item.user.first_name + ' ' + slotProps.item.user.last_name
                }}</a>
            </YogoTd>
            <YogoTd>{{
                slotProps.item.user.email
              }}
            </YogoTd>
            <YogoTd>
              {{ slotProps.item.status_text }}
            </YogoTd>
            <YogoTd>
              {{ slotProps.item.next_payment && slotProps.item.next_payment.date ? unknownFormatDateToHumanDate(slotProps.item.next_payment.date) : '-' }}
            </YogoTd>
            <YogoTd>
              {{ slotProps.item.next_payment ? formatCurrencyDkk(slotProps.item.next_payment.amount) : '-' }}
            </YogoTd>
            <YogoTd>
              {{ slotProps.item.payment_option.number_of_months_payment_covers }}
            </YogoTd>
            <YogoTd>
              {{
                slotProps.item.membership_campaign ? slotProps.item.membership_campaign.name + ' (' + slotProps.item.membership_campaign_number_of_reduced_payments_left + ' reducerede betalinger tilbage)' : ''
              }}
            </YogoTd>
            <YogoTd>
              {{ slotProps.item.discount_code ? slotProps.item.discount_code.name : '' }}
            </YogoTd>
            <YogoTd>
              {{ slotProps.item.createdAt | moment('D. MMMM YYYY') }}
            </YogoTd>
            <YogoTd>
              <router-link :to="{name: 'Membership', params: {id: slotProps.item.id}}">
                {{ $t('global.Edit') }}
              </router-link>
            </YogoTd>
          </template>
        </YogoTable>


      </div>
    </div>

    <md-dialog :md-active.sync="showExportMembershipEmailsDialog">
      <md-dialog-title>{{ $t('global.ExportEmails') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.Emails') }}</label>
          <md-textarea v-model="exportMembershipEmailsResult"
                       id="export-membership-emails-result"></md-textarea>
        </md-field>
        <p>
          {{ $t('global.ExportEmailsDesc') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="showExportMembershipEmailsDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>

</template>

<script>

import YogoApi from '../gateways/YogoApi';
import Imagefield from './ImageField.vue';
import LoadingAnimation from './LoadingAnimation.vue';
import moment from 'moment-timezone';
import MembershipCampaignFormRow from './MembershipCampaignFormRow';

import { mapGetters } from 'vuex';
import dateTimeFunctions from '../mixins/dateTimeFunctions';
import currencyFormatters from '../mixins/currencyFormatters';
import YogoTable from '@/components/ui/YogoTable';
import YogoTd from '@/components/ui/YogoTd';
import YogoTreeselectClassTypes from '@/components/ui/YogoTreeselectClassTypes';
import YogoTreeselectVideoGroups from '@/components/ui/YogoTreeselectVideoGroups';
import YogoTreeselectPriceGroups from '@/components/ui/YogoTreeselectPriceGroups';

const {
  required,
  numeric,
  minLength,
  minValue,
  maxValue,
} = require('vuelidate/lib/validators');

export default {

  components: {
    YogoTreeselectPriceGroups,
    YogoTreeselectVideoGroups,
    YogoTreeselectClassTypes,
    LoadingAnimation,
    Imagefield,
    MembershipCampaignFormRow,
    YogoTable,
    YogoTd,
  },
  props: ['formType'],
  mixins: [dateTimeFunctions, currencyFormatters],
  data() {
    return {
      originalMembershipType: null,
      form: {
        class_types: [],
        class_types_livestream: [],
        video_groups: [],
        price_groups: [],
        access_all_videos: false,
        send_email_to_customer: false,
        has_max_number_of_memberships: false,
        has_max_number_of_classes_per_week: false,
        max_number_of_classes_per_week: 2,
        has_max_number_of_simultaneous_bookings: false,
        max_number_of_simultaneous_bookings: 10,
        active_campaign: null,
      },

      hasActiveCampaign: false,

      saveLabel: this.formType === 'edit' ? this.$t('global.Save') : this.$t('global.Create'),

      pageTitle: this.formType === 'edit' ? this.$t('global.EditMembershipType') : this.$t('global.CreateMembershipType'),

      loading: this.formType === 'edit',

      paymentOptions: [
        {
          name: this.$t('global.Monthly'),
          number_of_months_payment_covers: 1,
          for_sale: true,
        },
      ],

      currentMembershipSort: 'sort_full_name',
      currentMembershipSortOrder: 'asc',

      selectedMemberships: [],
      showExportMembershipEmailsDialog: false,

      membershipsTableCols: [
        {
          label: this.$t('global.Customer'),
          sortBy: 'sort_full_name',
        },
        {
          label: this.$t('global.Email'),
          sortBy: 'sort_email',
        },
        {
          label: this.$t('global.Status'),
          sortBy: 'sort_status',
        },
        {
          label: this.$t('global.NextPayment'),
          sortBy: 'sort_next_payment_date',
        },
        {
          label: this.$t('global.Amount'),
          sortBy: 'sort_next_payment_amount',
        },
        {
          label: this.$t('global.Months'),
          sortBy: 'sort_months',
        },
        {
          label: this.$t('global.Campaign'),
          sortBy: 'sort_campaign',
        },
        {
          label: this.$t('global.PromotionCode'),
          sortBy: 'sort_discount_code',
        },
        {
          label: this.$t('global.Created'),
          sortBy: 'createdAt',
        },
        { label: '' },
      ],
    };
  },

  computed: {
    ...mapGetters([
      'client',
    ]),

    showDeleteMembershipTypeButton() {
      return this.formType === 'edit' && !this.originalMembershipType.memberships.length;
    },
    activeMembershipCount() {
      return _.filter(this.originalMembershipType.memberships, membership => {
        return membership.status === 'active' &&
            membership.payment_subscriptions.length &&
            !membership.renewal_failed;
      }).length;
    },
    activeNoPaymentOptionMembershipCount() {
      const sixDaysAhead = moment()
          .add(6, 'days');
      return _.filter(this.originalMembershipType.memberships, membership => {
        return membership.status === 'active' &&
            !membership.payment_subscriptions.length;
      }).length;
    },
    missingPaymentOptionAndPaymentDatePassed() {
      return _.filter(this.originalMembershipType.memberships, membership => {
        return membership.status === 'active' &&
            !membership.payment_subscriptions.length &&
            moment(membership.paid_until)
                .isBefore(moment(), 'day');
      }).length;
    },
    cancelledRunningMembershipCount() {
      return _.filter(this.originalMembershipType.memberships, membership => {
        return membership.status === 'cancelled_running';
      }).length;
    },
    renewalDeclinedMembershipCount() {
      return _.filter(this.originalMembershipType.memberships, membership => {
        return membership.status === 'active' &&
            membership.payment_subscriptions.length &&
            membership.renewal_failed;
      }).length;
    },
    exportMembershipEmailsResult() {
      const emails = _.map(this.selectedMemberships, membership => membership.user.email);
      return emails.join(';');
    },
  },

  created: async function () {
    if (this.formType === 'edit') {

      await this.fetchMembershipType();

      this.loading = false;

    }
  },

  methods: {
    async fetchMembershipType() {
      this.hasActiveCampaign = true;
      this.form = (await YogoApi.get('/membership-types' +
          '?id=' + this.$route.params.id +
          '&populate[]=image' +
          '&populate[]=class_types' +
          '&populate[]=class_types_livestream' +
          '&populate[]=video_groups' +
          '&populate[]=price_groups' +
          '&populate[]=payment_options' +
          '&populate[]=payment_options.membershipCount' +
          '&populate[]=memberships' +
          '&populate[]=memberships.user' +
          '&populate[]=memberships.user.image' +
          '&populate[]=memberships.payment_subscriptions' +
          '&populate[]=memberships.payment_option' +
          '&populate[]=memberships.discount_code' +
          '&populate[]=memberships.membership_campaign' +
          '&populate[]=memberships.next_payment' +
          '&populate[]=memberships.status_text' +
          '&populate[]=active_campaign',
      ))[0];
      this.originalMembershipType = _.cloneDeep(this.form);
      _.each(this.originalMembershipType.memberships, membership => {
        membership.sort_email = membership.user.email;
        membership.sort_full_name = membership.user.first_name + ' ' + membership.user.last_name;
        membership.sort_months = parseInt(membership.payment_option.number_of_months_payment_covers);
        membership.sort_status = membership.status_text;
        membership.sort_next_payment_amount = membership.next_payment ? parseFloat(membership.next_payment.amount) : 0;
        membership.sort_next_payment_date = membership.next_payment ? membership.next_payment.date : '';
        membership.sort_discount_code = membership.discount_code ? membership.discount_code.name : '';
        membership.sort_campaign = membership.membership_campaign ? membership.membership_campaign.name : '';

      });

      delete this.form.memberships;

      this.paymentOptions = _.sortBy(this.form.payment_options, 'number_of_months_payment_covers');
      this.$set(this.form, 'class_types', _.map(this.form.class_types, 'id'));
      this.$set(this.form, 'class_types_livestream', _.map(this.form.class_types_livestream, 'id'));
      this.$set(this.form, 'video_groups', _.map(this.form.video_groups, 'id'));
      this.form.price_groups = _.map(this.form.price_groups, 'id');

      this.hasActiveCampaign = !!this.form.active_campaign;
    },
    async submit() {

      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      if (this.formType === 'edit' && !this.checkAndConfirmChangesToPaymentOptions()) {
        return;
      }

      // If there is an active campaign, there must also be a payment option for one month
      if (
          this.form.active_campaign &&
          !_.find(this.paymentOptions, paymentOption => parseInt(paymentOption.number_of_months_payment_covers) === 1 && paymentOption.for_sale)
      ) {
        alert(this.$t('global.ActiveCampaignDesc'));
        return;
      }

      let membershipTypeData = _.pick(this.form, [
        'name',
        'description',
        'monthly_price',
        'image_id',
        'class_types',
        'class_types_livestream',
        'video_groups',
        'price_groups',
        'send_email_to_customer',
        'email_subject',
        'email_body',
        'has_max_number_of_memberships',
        'max_number_of_memberships',
        'has_max_number_of_classes_per_week',
        'max_number_of_classes_per_week',
        'has_max_number_of_simultaneous_bookings',
        'max_number_of_simultaneous_bookings',
        'active_campaign',
      ]);

      if (this.client.extended_video_enabled) {
        membershipTypeData.access_all_videos = this.form.access_all_videos;
      }

      membershipTypeData.image = membershipTypeData.image_id;
      delete membershipTypeData.image_id;

      membershipTypeData.payment_options = _.map(
          this.paymentOptions,
          paymentOption => _.pick(paymentOption, ['id', 'name', 'number_of_months_payment_covers', 'payment_amount', 'for_sale']),
      );


      if (this.formType === 'edit') {

        await YogoApi.put('/membership-types/' + this.$route.params.id, membershipTypeData);

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.hasBeenUpdated'),
        });

      } else {
        await YogoApi.post('/membership-types', membershipTypeData);

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.isCreated'),
        });

      }
      this.$router.push({ name: 'Prices' });

    },

    checkAndConfirmChangesToPaymentOptions() {

      // Check for more options for sale with same number of months
      const numberOfMonthsWithDuplicatePaymentOptionsForSale = _.chain(this.paymentOptions)
          .groupBy(po => (po.for_sale ? 'for_sale_' : '') + po.number_of_months_payment_covers)
          .pickBy((poGroup, key) => poGroup.length > 1 && key.substr(0, 9) === 'for_sale_')
          .keys()
          .filter(poGroup => poGroup.substr(9))
          .value();


      if (numberOfMonthsWithDuplicatePaymentOptionsForSale.length) {
        alert(this.$t('global.NotPossibleWithMoreOfSamePaymentOptionsDesc') + numberOfMonthsWithDuplicatePaymentOptionsForSale[0].substr(9) + ').');
        return false;
      }

      // Check for changed prices
      const paymentOptionsWithNewPrices = _(this.paymentOptions)
          .filter('id')
          .filter(po => {
            const originalPaymentOption = _.find(this.originalMembershipType.payment_options, { id: po.id });
            return parseFloat(originalPaymentOption.payment_amount) !== parseFloat(po.payment_amount);
          })
          .value();


      if (
          paymentOptionsWithNewPrices.length &&
          !confirm(
              this.$t('global.YouHaveChangedPriceForPaymentOptions') +
              _.map(paymentOptionsWithNewPrices, paymentOption => {
                const originalPaymentOption = _.find(this.originalMembershipType.payment_options, { id: paymentOption.id });
                return '\n - ' + paymentOption.name + ' (' + this.$options.filters.currency_dkk(originalPaymentOption.payment_amount) + ' -> ' + this.$options.filters.currency_dkk(paymentOption.payment_amount) + ')';
              })
                  .join('') +
              this.$t('global.CustomersWithChosenPaymentOptionsDesc'),
          )
      ) {
        return false;
      }

      return true;

    },

    addPaymentOption() {
      this.paymentOptions.push({
        name: '',
        payment_amount: 0,
        number_of_months_payment_covers: '',
        for_sale: true,
      });
      this.$nextTick(() => {
        const rows = document.querySelectorAll('.payment-option-row');
        const lastRow = rows[rows.length - 1];
        const inputs = lastRow.querySelectorAll('input[type=text]');
        const nameInput = inputs[0];
        nameInput.focus();
      });
    },

    deletePaymentOption(idx) {
      if (this.paymentOptions.length === 1) {
        alert(this.$t('global.HasToBeAtLeastOnePaymentOptionDesc'));
        return;
      }

      if (this.paymentOptions[idx].membershipCount > 0) {
        alert(this.$t('global.YouCantDeletePaymentOptionActiveDesc'));
        return;
      }
      this.paymentOptions.splice(idx, 1);
    },

    async destroy() {

      if (!confirm(this.$t('global.DoYouWantToDeleteMembershipType'))) return;

      await YogoApi.delete('/membership-types/' + this.$route.params.id);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.form.name + this.$t('global.isDeleted'),
      });

      this.$router.push({ name: 'Prices' });
    },

    getValidationClass(fieldPath) {

      const field = _.get(this.$v, fieldPath);

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },
    customMembershipSort(value) {
      return value.sort((a, b) => {
        const sortBy = this.currentMembershipSort;

        const aString = _.isNumber(a[sortBy]) ? a[sortBy].toString() : a[sortBy];
        const bString = _.isNumber(b[sortBy]) ? b[sortBy].toString() : b[sortBy];

        if (this.currentMembershipSortOrder === 'desc') {
          return aString.localeCompare(bString);
        }

        return bString.localeCompare(aString);
      });
    },
    onMembershipSelect(items) {
      this.selectedMemberships = items;
    },

  },

  watch: {
    hasActiveCampaign(newHasActiveCampaign) {
      this.form.active_campaign = newHasActiveCampaign ?
          {
            name: this.$t('global.NewCampaign'),
            number_of_months_at_reduced_price: 1,
            reduced_price: 0,
            min_number_of_months_since_customer_last_had_membership_type: 12,
          } :
          null;
    },
  },

  validations() {
    let v = {
      form: {
        name: {
          required,
        },
      },
    };

    if (this.form.has_max_number_of_memberships) {
      v.form.max_number_of_memberships = {
        required,
        minValue: minValue(0),
      };
    }

    if (this.form.has_max_number_of_classes_per_week) {
      v.form.max_number_of_classes_per_week = {
        required,
        minValue: minValue(1),
      };
    }

    if (this.form.has_max_number_of_simultaneous_bookings) {
      v.form.max_number_of_simultaneous_bookings = {
        required,
        minValue: minValue(1),
      };
    }

    if (this.form.send_email_to_customer) {
      v.form.email_subject = {
        required,
      };
      v.form.email_body = {
        required,
      };
    }

    if (this.paymentOptions) {
      v.paymentOptions = {
        $each: {
          name: {
            required,
          },
          number_of_months_payment_covers: {
            required,
            numeric,
            minValue: minValue(1),
            maxValue: maxValue(60),
          },
          payment_amount: {
            required,
            numeric,
            minValue: minValue(1),
          },
        },
      };
    }

    if (this.form.active_campaign) {
      v.form.active_campaign = {
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
      };
    }
    return v;
  },
};

</script>

<style lang="stylus" scoped>

.payment-option-row
  position relative

.delete-payment-option-button
  position absolute
  right 0


</style>
