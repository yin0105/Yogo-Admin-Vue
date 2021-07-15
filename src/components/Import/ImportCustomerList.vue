<template>
  <div>
    <div class="space4"></div>

    <md-button class="md-raised md-primary" @click="$emit('calculateCustomerList')">Beregn importliste
    </md-button>

    <div class="space4"></div>

    <table  v-if="customerList.length">
      <tr>
        <th>
          <button type="button" @click="$emit('deselectCustomersWithoutEmail')">
            Deselect customers without email
          </button>
          <button type="button" @click="$emit('deselectInactiveCustomers')">
            Deselect inactive customers
          </button>
          <button type="button" @click="$emit('saveCustomerSelection')">
            Save selections
          </button>
          <button type="button" @click="$emit('loadCustomerSelection')">
            Load selections
          </button>
          <button type="button" @click="$emit('resolveDuplicateEmails')">
            Resolve duplicate emails
          </button>
          <button type="button" @click="$emit('selectAll')">
            Select all
          </button>
          <button type="button" @click="$emit('deselectZipCodesFrom5000Up')">
            Deselect customers with zip codes from 5000 and up
          </button>
        </th>
        <th>
          Email
        </th>
        <th>
          Fornavn
        </th>
        <th>
          Efternavn
        </th>
        <th>
          Adresse
        </th>
        <th>
          Postnummer
        </th>
        <th>
          By
        </th>
        <th>
          Land
        </th>
        <th>
          Telefon
        </th>
        <th>
          Fødselsdato
        </th>
        <th>
          Oprettet
        </th>
        <th>
          Adgang
        </th>
        <th>
          Tilmelding klasser
        </th>
        <th>
          Tilmelding events
        </th>
        <th>
          ID i tidligere system
        </th>
      </tr>
      <tr v-for="(customer, idx) in customerList" class="customer"
          :class="{selected: selectedCustomers[idx], duplicate: emailDuplicates[idx]}"
          :key="'customer_' + idx">
        <td>
          <input @click.stop="$emit('toggleRowSelection',idx)" :checked="selectedCustomers[idx]"
                 type="checkbox">
          <span v-if="selectedCustomers[idx] && emailDuplicates[idx]">(D)</span>
        </td>
        <td>
          {{ customer.email }}
        </td>
        <td>
          {{ customer.first_name }}
        </td>
        <td>
          {{ customer.last_name }}
        </td>
        <td>
          {{ customer.address_1 }}<span v-if="customer.address_2"><br>{{ customer.address_2 }}</span>
        </td>
        <td>
          {{ customer.zip_code }}
        </td>
        <td>
          {{ customer.city }}
        </td>
        <td>
          {{ customer.country }}
        </td>
        <td>
          {{ customer.phone }}
        </td>
        <td>
          {{ customer.date_of_birth ? customer.date_of_birth : '--' }}
        </td>
        <td>
          {{ customer.profile_created || '--' }}
        </td>
        <td>
          <div v-for="classPass in customer.class_passes" class="access-item">
            {{ classPass.classPassTypeName }}<br>
            Oprettet {{ classPass.start_date }}<br>
            <span
                v-if="classPass.classPassTypePassType === 'fixed_count'">{{ classPass.classes_left }} klip tilbage<br></span>
            Gyldig t.o.m. {{ classPass.valid_until }}
          </div>
          <div v-for="membership in customer.memberships" class="access-item">
            {{ membership.membershipTypeName }}<br>
            Betalt t.o.m. {{ membership.paid_until }}
            <span v-if="membership.holdPeriodActive"><br>(Hold period active)</span>
          </div>
          <div v-if="customer.memberships.length + customer.class_passes.length > 1">[MULTIPLE
            ACCESS ITEMS]
          </div>
        </td>
        <td>
          <div v-for="signup in customer.class_signups" class="signup">
            {{ signup.yogoClass.date }} <br>
            kl. {{ signup.yogoClass.start_time }}-{{signup.yogoClass.end_time}}<br>
            {{ signup.yogoClass.class_type.name}}<br>
            ({{ signup.accessObjectName }})
          </div>
        </td>
        <td>
          <div v-for="eventSignup in customer.event_signups" class="event-signup">
            {{ eventSignup.eventName }}
          </div>
          <div v-if="customer.event_signups.length > 1">[MULTIPLE
            EVENT SIGNUPS]
          </div>
        </td>
        <td>
          {{ customer.id_in_previous_booking_system}}
        </td>
      </tr>
    </table>

    <md-button class="md-raised md-primary" @click="doImport">Importer</md-button>
    <div class="space8"></div>
  </div>

</template>


<script>

  import YogoApi from '../../gateways/YogoApi'

  export default {
    name: 'ImportCustomerList',
    props: ['customerList', 'selectedCustomers', 'emailDuplicates'],

    methods: {
      async doImport() {
        this.loading = true

        if (this.emailDuplicates.find(item => item)) {
          this.loading = false
          alert('Der er duplikerede emailadresser i listen')
          return
        }

        const importCustomers = _.filter(this.customerList, (customer, idx) => this.selectedCustomers[idx])

        let importResponse
        try {
          importResponse = await YogoApi.post('/import/customers', { customers: importCustomers })
        } catch (e) {
          this.loading = false
          this.$nextTick(() => {
            alert('Api\'en giver følgende fejl: \n' + e.response.data)
          })
          return
        }

        this.loading = false

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: 'Listen er importeret',
        })
      },
    },
    watch: {
      selectedCustomers() {
        console.log('selectedCustomers changed')
      }
    }
  }

</script>

<style lang="scss" scoped>

  table {
    border-collapse: collapse;
  }

  tr.selected {
    background: white;
  }

  tr.customer:not(.selected) {
    background: #999;
  }

  tr.duplicate {
    background: pink;
  }

  tr.awaiting-selection {
    background: pink;
  }

  th, td {
    border: 1px solid black;
    padding: 1px 4px;
    text-align: left;

  }

  .access-item {
    border: 1px solid forestgreen;
    background: palegreen;
    white-space: nowrap;
    margin: 2px;
    padding: 2px 4px;
  }

  .signup {
    border: 1px solid cornflowerblue;
    background: aliceblue;
    white-space: nowrap;
    margin: 2px;
    padding: 2px 4px;
  }

  .event-signup {
    border: 1px solid orange;
    background: lightgoldenrodyellow;
    white-space: nowrap;
    margin: 2px;
    padding: 2px 4px;
  }


</style>
