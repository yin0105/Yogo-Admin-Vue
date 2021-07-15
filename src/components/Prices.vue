<template>
  <div class="customers">
    <h2>{{ $t('global.Prices') }}</h2>

    <md-button class="md-fab turkis md-fixed md-fab-top-right"
               @click="showSelectMembershipTypeDialog = true">
      <md-icon>add</md-icon>
      <md-tooltip md-direction="left">{{ $t('global.CreateMembershipClassPass') }}</md-tooltip>
    </md-button>

    <div class="space4"></div>

    <LoadingAnimation v-if="loading"></LoadingAnimation>

    <div v-else>

      <MembershipTypeList :membershipTypes="membershipTypes"></MembershipTypeList>

      <div class="space8"></div>

      <ClassPassTypeFixedCountList
          :classPassTypes="classPassTypesFixedCount"></ClassPassTypeFixedCountList>

      <div class="space8"></div>

      <ClassPassTypeTimeBasedList
          :classPassTypes="classPassTypesTimeBased"></ClassPassTypeTimeBasedList>

      <div class="space8"></div>

      <md-dialog :md-active.sync="showSelectMembershipTypeDialog">
        <md-dialog-title>{{ $t('global.CreateWhatTypeOfMembershipDesc') }}</md-dialog-title>
        <div class="md-primary absolute__top--right pointer"
             @click="showSelectMembershipTypeDialog = false">
          <md-icon>close</md-icon>
        </div>
        <md-dialog-content>

          <router-link :to="{name:'MembershipTypeAdd'}">
            <md-button class="md-raised md-primary">
              {{ $t('global.MembershipWithRecurringPayments') }}
            </md-button>
          </router-link>

          <router-link :to="{name:'ClassPassTypeFixedCountAdd'}">
            <md-button class="md-raised md-primary">
              {{ $t('global.ClassPassFixedNumber') }}
            </md-button>
          </router-link>

          <router-link :to="{name:'ClassPassTypeTimeBasedAdd'}">
            <md-button class="md-raised md-primary">
              {{ $t('global.ClassPassTimeBased') }}
            </md-button>
          </router-link>

        </md-dialog-content>
      </md-dialog>

    </div>
  </div>

</template>

<script>

  import ClassPassTypeTimeBasedList from './ClassPassTypeTimeBasedList'
  import MembershipTypeList from './MembershipTypeList'
  import LoadingAnimation from './LoadingAnimation.vue'
  import YogoApi from '../gateways/YogoApi'
  import ClassPassTypeFixedCountList from './ClassPassTypeFixedCountList.vue'


  export default {
    name: 'Prices',
    components: {
      ClassPassTypeFixedCountList,
      LoadingAnimation,
      ClassPassTypeTimeBasedList,
      MembershipTypeList,
    },
    data() {
      return {
        classPassTypes: [],
        membershipTypes: [],

        loading: true,

        showSelectMembershipTypeDialog: false,
      }
    },
    computed: {
      classPassTypesFixedCount() {
        return _.filter(this.classPassTypes, { pass_type: 'fixed_count' })
      },
      classPassTypesTimeBased() {
        return _.filter(this.classPassTypes, { pass_type: 'unlimited' })
      },
    },
    methods: {
      async fetchData() {
        try {

          [this.classPassTypes, this.membershipTypes] = await Promise.all([
            YogoApi.get('/class-pass-types' +
              '?populate[]=price_groups',
            ),
            YogoApi.get('/membership-types' +
              '?populate[]=payment_options' +
              '&populate[]=price_groups' +
              '&populate[]=active_campaign' +
              '&populate[]=membershipCount',
            ),
          ])

          this.loading = false

        } catch (err) {
          console.log(err)
        }

      },
    },
    created() {
      this.fetchData()
    },
  }
</script>
