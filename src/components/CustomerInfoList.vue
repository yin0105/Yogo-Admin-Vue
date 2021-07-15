<template>
  <md-card class="padding1">
    <div class="flex__2-2--container">
      <ul class="list--standard">
        <li><span>{{ $t('global.Name') }}: </span>{{ customer.first_name + ' ' + customer.last_name }}</li>
        <li><span>{{ $t('global.Email') }}: </span><a :href="'mailto:' + customer.email">{{ customer.email }}</a></li>
        <li><span>{{ $t('global.Phone') }}: </span><a :href="'tel:' + customer.phone">{{ customer.phone }}</a></li>
        <li><span>{{ $t('global.DateOfBirth') }}: </span>{{ customer.date_of_birth ? dbDateToHumanDate(customer.date_of_birth) : '' }}</li>
        <li><span>{{ $t('global.Created') }}: </span>{{ timeStampToHumanDate(customer.createdAt) }}</li>
      </ul>
      <div class="space4"></div>
      <ul class="list--standard">
        <li><span>{{ $t('global.Address1') }}: </span>{{ customer.address_1 }}</li>
        <li><span>{{ $t('global.Address2') }}: </span>{{ customer.address_2 }}</li>
        <li><span>{{ $t('global.Zip') }}: </span>{{ customer.zip_code }}</li>
        <li><span>{{ $t('global.City') }}: </span>{{ customer.city }}</li>
        <li><span>{{ $t('global.Country') }}: </span>{{ customer.country }}</li>
      </ul>
    </div>
    <div class="padding1" v-if="client.settings.customer_profile_use_additional_info_field">
      <p>{{ $t('global.AdditionalInformation') }}: {{ customer.customer_additional_info }}</p>
    </div>

  </md-card>
</template>

<script>

  import {mapGetters} from 'vuex'
  import dateTimeFunctions from '../mixins/dateTimeFunctions'

  export default {
    mixins: [dateTimeFunctions],
    data() {
      return {
        customerInfoTitle: 'Kundeinfo',
        customerName: 'Navn',
        customerEmail: 'E-mail',
        customerPhone: 'Telefonnr.',
        customerAdded: 'Oprettet',
        customerAddress1: 'Adresse 1',
        customerAddress2: 'Adresse 2',
        customerZip: 'Postnr.',
        customerCity: 'By',
        customerCountry: 'Land',
        customerBirth: 'Fødselsdato',
      }
    },
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    props: ['customer'],
  }

</script>

