<template>
  <div class="customerinfo">
    <loading-animation v-if="loading"></loading-animation>
    <div v-else>
      <div class="flex__2-1--container">
        <h2>{{ $t('global.CustomerInfo') }}</h2>
      </div>

      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'Customers' }">{{ $t('global.Back') }}</router-link>
      </md-button>
      <md-button class="md-raised">
        <router-link :to="{ name: 'CustomerHistory', params:{id: $route.params.id} }">
          {{ $t('global.CustomerHistory') }}
        </router-link>
      </md-button>
      <div class="space4"></div>

      <div class="flex__2-1--container">
        <div class="image__info--container">
          <a href="#"><img class="circle" :src="profileImageSrc(customer.image)"></a>
          <div class="card__header--info-left-inner">
            <h4>{{ customer.first_name + ' ' + customer.last_name }}</h4>
          </div>
        </div>
        <div class="space4"></div>


        <md-button class="md-fab turkis md-fixed md-fab-top-right">
          <router-link :to="{ name: 'CustomerEdit', params: {id: $route.params.id} }">
            <md-icon>edit</md-icon>
            <md-tooltip md-direction="left">{{ $t('global.Edit') }}</md-tooltip>
          </router-link>
        </md-button>

      </div>

      <div class="space8"></div>

      <CustomerInfoList :customer="customer"></CustomerInfoList>

      <div class="space8"></div>
      <div class="divider black"></div>
      <div class="space4"></div>

      <h3>{{ $t('global.RegisteredClasses') }}</h3>

      <TableRegisteredClasses
          :classes="signedUpForClasses"
          v-if="signedUpForClasses.length"
          @didDeleteSignup="didDeleteSignup"
      >
      </TableRegisteredClasses>

      <p v-else>{{ $t('global.NoClassesRegistered') }}</p>

      <CustomerAddOptionsClass
          :customer="customer"
          :customerClassPasses="customer.class_passes"
          :customerMemberships="customer.memberships"
          :signedUpForClasses="signedUpForClasses"
          @newCustomerSignup="refreshCustomer"
      >
      </CustomerAddOptionsClass>

      <div class="space8"></div>

      <h3>{{ $t('global.RegisteredEvents') }}</h3>

      <TableRegisteredEvents
          :eventSignups="eventSignups"
          v-if="eventSignups.length"
          @refreshCustomer="refreshCustomer"
      >
      </TableRegisteredEvents>

      <p v-else>
        {{ $t('global.NoEventsRegistered') }}
      </p>

      <CustomerAddOptionsEvent
          :eventSignups="eventSignups"
          @refreshCustomer="refreshCustomer"
      >
      </CustomerAddOptionsEvent>

      <div class="space8"></div>
      <div class="divider black"></div>
      <div class="space4"></div>


      <h3>{{ $t('global.Memberships') }}</h3>

      <TableMemberships
          :memberships="customer.memberships"
      >
      </TableMemberships>

      <CustomerAddOptionsMembershipType
          :memberships="customer.memberships"
          :customer="customer"
          @refreshCustomer="refreshCustomer"
      >
      </CustomerAddOptionsMembershipType>


      <div class="space8"></div>
      <div class="divider black"></div>
      <div class="space4"></div>


      <h3>{{ $t('global.ClassPasses') }}</h3>

      <CustomerClassPasses :customerClassPasses="customer.class_passes"
                           v-if="customer.class_passes && customer.class_passes.length"></CustomerClassPasses>
      <p v-else>{{ $t('global.NoClassPassesGlobal') }}</p>

      <CustomerAddOptionsClassPassType :customersClassPasses="customer.class_passes"
                                       @newClassPass="addedClassPass"></CustomerAddOptionsClassPassType>


      <div class="space8"></div>

    </div>

  </div> <!-- customerinfo -->

</template>

<script>
import CustomerInfoList from './CustomerInfoList';
import TableRegisteredClasses from './CustomerClasses';
import TableRegisteredEvents from './CustomerEvents';
import CustomerClassPasses from './CustomerClassPasses';
import TableMemberships from './CustomerMemberships.vue';
import CustomerAddOptionsClass from './CustomerAddOptionsClass';
import CustomerAddOptionsEvent from './CustomerAddOptionsEvent';
import CustomerAddOptionsClassPassType from './CustomerAddOptionsClassPassType';
import CustomerAddOptionsMembershipType from './CustomerAddOptionsMembershipType';


import { mapGetters } from 'vuex';
import YogoApi from '@/gateways/YogoApi';
import LoadingAnimation from './LoadingAnimation.vue';
import moment from 'moment-timezone';
import Imgix from '@/services/Imgix';

export default {
  name: 'CustomerInfo',
  components: {
    LoadingAnimation,
    TableRegisteredClasses,
    TableRegisteredEvents,
    CustomerInfoList,
    CustomerClassPasses,
    CustomerAddOptionsClass,
    CustomerAddOptionsEvent,
    CustomerAddOptionsClassPassType,
    CustomerAddOptionsMembershipType,
    TableMemberships,

  },
  data() {
    return {
      customer: {},
      signedUpForClasses: [],
      classLivestreamSignups: [],
      eventSignups: [],
      loading: true,
    };
  },
  mixins: [Imgix],
  computed: {
    ...mapGetters([
      'stateReady',
    ]),
  },
  methods: {
    async fetchAllData() {
      let classesResponse;
      [this.customer, classesResponse, this.classLivestreamSignups, this.eventSignups] = await Promise.all([
        YogoApi.get('/users' +
            '?id=' + this.$route.params.id +
            '&populate[]=memberships' +
            '&populate[]=memberships.membership_type' +
            '&populate[]=memberships.membership_type.class_types' +
            '&populate[]=memberships.payment_option' +
            '&populate[]=memberships.payment_subscriptions' +
            '&populate[]=memberships.next_payment' +
            '&populate[]=memberships.status_text' +

            '&populate[]=class_passes' +
            '&populate[]=class_passes.class_pass_type' +
            '&populate[]=class_passes.class_pass_type.class_types' +

            '&populate[]=image',
        ),
        YogoApi.get('/classes' +
            '?userIsSignedUpOrOnWaitingList=' + this.$route.params.id +
            '&startDate=' + moment()
                .format('YYYY-MM-DD', 'Europe/Copenhagen') +
            '&endDate=' + moment.tz('Europe/Copenhagen')
                .add(1, 'year')
                .subtract(1, 'day')
                .format('YYYY-MM-DD') +
            '&populate[]=class_type' +
            '&populate[]=teachers' +
            '&populate[]=room' +
            '&populate[]=user_is_signed_up_for_waiting_list' +
            '&populate[]=user_number_on_waiting_list' +
            '&populate[]=admin_can_sign_user_off_from_class' +
            '&populate[]=admin_can_sign_user_off_from_waiting_list' +
            '&populate[]=admin_can_sign_user_off_from_livestream',
        ),
        YogoApi.get('/class-livestream-signups' +
            '?user=' + this.$route.params.id +
            '&startDate=' + moment()
                .format('YYYY-MM-DD') +
            '&populate[]=class' +
            '&populate[]=class.class_type' +
            '&populate[]=class.teachers' +
            '&populate[]=class.room',
        ),
        YogoApi.get('/event-signups' +
            '?user=' + this.$route.params.id +
            '&startDate=' + moment()
                .subtract(6, 'months')
                .format('YYYY-MM-DD') +
            '&populate[]=event' +
            '&populate[]=event.event_group' +
            '&populate[]=event.room' +
            '&populate[]=event.teachers' +
            '&populate[]=event.time_slots',
        ),
      ]);

      if (_.isArray(this.customer)) {
        this.customer = this.customer[0];
      }

      if (this.customer.archived) {
        alert(this.$t('global.ThisCustomerHasBeenDeleted'));
        this.$router.push({ name: 'Customers' });
      }

      this.signedUpForClasses = _.sortBy(classesResponse.classes, ['date', 'start_time']);

      this.loading = false;

    },
    refreshCustomer() {
      this.fetchAllData();
    },
    addedClassPass(classPass) {
      this.fetchAllData();
    },
    newCustomerSignup(signup) {
      this.fetchAllData();
    },
    didDeleteSignup() {
      this.fetchAllData();
    },
  },
  mounted() {
    if (this.stateReady) this.fetchAllData();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchAllData();
    },
  },
};
</script>

<style lang="stylus">

.image__info--container
  display flex
  align-items center

  img
    width 60px
    height 60px
    margin-right 20px

</style>
