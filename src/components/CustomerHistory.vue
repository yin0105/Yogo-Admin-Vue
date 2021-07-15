<template>
  <div>
    <div class="flex__2-1--container">
      <h2>{{ $t('global.CustomerHistory') }}</h2>
    </div>

    <div class="space4"></div>
    <md-button class="md-raised">
      <router-link :to="{ name: 'CustomerInfo', params:{id: $route.params.id} }">{{ $t('global.Back') }}
      </router-link>
    </md-button>
    <div class="space4"></div>

    <LoadingAnimation v-if="loading"></LoadingAnimation>

    <div v-else>

      <div class="image__info--container">
        <img class="circle" :src="profileImageSrc(customer.image)">
        <div class="card__header--info-left-inner">
          <h4>{{ customer.first_name + ' ' + customer.last_name }}</h4>
        </div>
      </div>

      <div class="space4"></div>

      <CardDropdownWithIconAndText>
        <template v-slot:icon-and-title>
          <md-icon>schedule</md-icon>
          {{ $t('global.Classes') }} ({{ customer.class_signups.length + customer.class_livestream_signups.length }})
        </template>
        <CustomerHistoryClasses
            :classSignups="customer.class_signups"
            :class-livestream-signups="customer.class_livestream_signups"
        ></CustomerHistoryClasses>
      </CardDropdownWithIconAndText>


      <CardDropdownWithIconAndText>
        <template v-slot:icon-and-title>
          <md-icon>event</md-icon>
          {{ $t('global.Events') }} ({{ customer.event_signups.length }})
        </template>
        <CustomerHistoryEvents :eventSignups="customer.event_signups"></CustomerHistoryEvents>
      </CardDropdownWithIconAndText>


      <CardDropdownWithIconAndText>
        <template v-slot:icon-and-title>
          <md-icon>credit_card</md-icon>
          {{ $t('global.ClassPasses') }} ({{ customer.class_passes.length }})
        </template>
        <CustomerHistoryClassPasses :classPasses="customer.class_passes"></CustomerHistoryClassPasses>
      </CardDropdownWithIconAndText>


      <CardDropdownWithIconAndText>
        <template v-slot:icon-and-title>
          <md-icon>card_membership</md-icon>
          {{ $t('global.Memberships') }} ({{ customer.memberships.length }})
        </template>
        <CustomerHistoryMemberships :memberships="customer.memberships"></CustomerHistoryMemberships>
      </CardDropdownWithIconAndText>


      <CardDropdownWithIconAndText>
        <template v-slot:icon-and-title>
          <md-icon>attach_money</md-icon>
          {{ $t('global.Purchases') }} ({{ customer.orders.length }})
        </template>
        <CustomerHistoryOrders :orders="customer.orders"></CustomerHistoryOrders>
      </CardDropdownWithIconAndText>


    </div>

  </div>

</template>

<script>
import CustomerHistoryItem from './CardDropdownWithIconAndText';

import CustomerHistoryClasses from './CustomerHistoryClasses';
import CustomerHistoryEvents from './CustomerHistoryEvents';
import CustomerHistoryClassPasses from './CustomerHistoryClassPasses';
import CustomerHistoryMemberships from './CustomerHistoryMemberships';
import CustomerHistoryOrders from './CustomerHistoryOrders';

import LoadingAnimation from './LoadingAnimation';

import Imgix from '../services/Imgix';
import YogoApi from '../gateways/YogoApi';
import CardDropdownWithIconAndText from '@/components/CardDropdownWithIconAndText';

export default {
  name: 'CustomerHistory',
  mixins: [Imgix],
  components: {
    CardDropdownWithIconAndText,
    CustomerHistoryClasses,
    CustomerHistoryEvents,
    CustomerHistoryClassPasses,
    CustomerHistoryMemberships,
    CustomerHistoryOrders,
    CustomerHistoryItem,
    LoadingAnimation,
  },
  data() {
    return {
      customer: {},
      loading: true,
    };
  },
  async mounted() {
    this.customer = await YogoApi.get('/users/' + this.$route.params.id + '/history');

    if (this.customer.archived) {
      alert(this.$t('global.ThisCustomerHasBeenDeleted'));
      this.$router.push({ name: 'Customers' });
    }

    this.loading = false;
  },
  methods: {

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
