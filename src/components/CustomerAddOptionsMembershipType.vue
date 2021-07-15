<template>
  <div>
    <md-card>
      <md-list>
        <md-list-item md-expand>
          <md-icon>card_membership</md-icon>
          <span class="md-list-item-text">{{ $t('global.AddMembership') }}</span>
          <md-list slot="md-expand">
            <div class="padding1">
              <div class="space4"></div>
              <md-table v-model="membershipTypes" md-sort="name" md-sort-order="asc">
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell :md-label="$t('global.Membership')">{{ item.name }}</md-table-cell>
                  <md-table-cell :md-label="$t('global.SignedUp')" md-numeric>
                    {{ item.membershipCount }} <span v-if="item.has_max_number_of_memberships"> (max {{ item.max_number_of_memberships }})</span>
                  </md-table-cell>
                  <md-table-cell md-label="">
                    <md-button @click.prevent="openCreateMembershipDialog(item)" :disabled="customerHasMembershipType(item) && !client.settings.deprecated_sub_memberships_active">
                      <span v-if="!customerHasMembershipType(item) || client.settings.deprecated_sub_memberships_active">{{ $t('global.Create') }}</span>
                      <span v-if="customerHasMembershipType(item)">{{ $t('global.CustomerHasThisMembership') }}</span>
                    </md-button>
                  </md-table-cell>
                </md-table-row>
              </md-table>
            </div>
          </md-list>
        </md-list-item>
      </md-list>
    </md-card>

    <md-dialog :md-active.sync="showCreateMembershipDialog" v-if="dialogMembershipType">
      <md-dialog-title>
        {{ $t('global.Create') }} {{ dialogMembershipType.name }} {{ $t('global.for') }} {{ customer.first_name}} {{ customer.last_name}}
      </md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.PaymentPeriod') }}</label>
          <md-select v-model="dialogSelectedPaymentOption">
            <md-option v-for="paymentOption in dialogMembershipType.payment_options" :value="paymentOption.id"
                       :key="'paymentOption_' + paymentOption.id">
              {{ paymentOption.name }} / {{ paymentOption.payment_amount | currency_dkk }} kr.
            </md-option>
          </md-select>
        </md-field>
        <div>
          {{ $t('global.PaidUntil') }}<br>
          <md-datepicker md-immediately v-model="dialogDatePickerDate" class="not-clearable"></md-datepicker>
        </div>
        {{ $t('global.PaymentMembershipDesc') }}
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showCreateMembershipDialog = false">{{ $t('global.Dismiss') }}</md-button>
        <md-button @click="createMembership">{{ $t('global.CreateMembership') }}</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :active.sync="showLoadingDialog">
      <md-dialog-title>{{ $t('global.CreatingMembership') }}</md-dialog-title>
      <md-dialog-content>
        <md-progress-bar md-mode="indeterminate"></md-progress-bar>
      </md-dialog-content>

    </md-dialog>
  </div>
</template>

<script>

    import {mapGetters} from 'vuex'
    import YogoApi from '../gateways/YogoApi'
    import moment from 'moment'
    import Imagefield from "./ImageField";

    export default {
        components: {Imagefield},
        name: 'customeraddoptionsmembershiptype',
        data() {
            return {

                membershipTypes: [],

                showCreateMembershipDialog: false,
                dialogMembershipType: null,
                dialogSelectedPaymentOption: null,

                showLoadingDialog: false,

                realUserName: '',
                realUserImage: null
            }
        },

        props: ['memberships', 'customer'],
        created() {
            this.fetchMembershipTypes()
        },
        computed: {
            ...mapGetters([
                'stateReady',
                'user',
                'client'
            ])
        },
        methods: {
            async fetchMembershipTypes() {
                try {
                    this.membershipTypes = await YogoApi.get(
                        '/membership-types' +
                        '?populate[]=payment_options' +
                        '&populate[]=membershipCount'
                    )
                } catch (err) {
                    console.log(err)
                }

            },

            customerHasMembershipType(membershipType) {
                return !!_.find(
                  this.memberships,
                  membership => membership.membership_type.id === membershipType.id && membership.status !== 'ended'
                )
            },
            openCreateMembershipDialog(membershipType) {
                this.dialogMembershipType = membershipType;
                this.dialogSelectedPaymentOption = membershipType.payment_options[0].id;
                this.dialogDatePickerDate = new Date();
                this.showCreateMembershipDialog = true
            },
            async createMembership(membershipType) {
                this.showCreateMembershipDialog = false;
                this.showLoadingDialog = true;

                try {
                    const response = await YogoApi.post('/memberships', {
                        user: this.$route.params.id,
                        membership_type: this.dialogMembershipType.id,
                        payment_option: this.dialogSelectedPaymentOption,
                        paid_until: moment(this.dialogDatePickerDate).format('YYYY-MM-DD'),
                        real_user_is_someone_else: this.realUserName || this.realUserImage,
                        real_user_name: this.realUserName,
                        real_user_image: this.realUserImage
                    });

                    this.showLoadingDialog = false;

                    this.$store.commit('postFlashMessage', {
                        type: 'MESSAGE_TYPE_INFO',
                        text: this.dialogMembershipType.name + this.$t('global.isCreatedFor') + this.customer.first_name + ' ' + this.customer.last_name
                    });

                    this.$emit('refreshCustomer')
                } catch (err) {
                    alert(this.$t('global.ErrorOccuredDesc') + err.message);
                    console.log(err);
                    this.showLoadingDialog = false;
                }


            }
        }

    }
</script>
