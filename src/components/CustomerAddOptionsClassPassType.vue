<template>
  <div>
    <md-card>
      <md-list>
        <md-list-item md-expand>
          <md-icon>credit_card</md-icon>
          <span class="md-list-item-text">{{ $t('global.AddClassPass') }}</span>

          <md-list slot="md-expand">

            <div class="padding1">

              <div class="space4"></div>

              <md-table v-model="classPassTypes" md-sort="name" md-sort-order="asc">

                <md-table-empty-state
                  md-label=""
                  md-description="">
                  {{ $t('global.NoClassPasses') }}
                </md-table-empty-state>

                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell :md-label="$t('global.ClassPassType')" md-sort-by="name">{{ item.name }}</md-table-cell>
                  <md-table-cell :md-label="$t('global.NumberOfClasses')" md-numeric>
                    {{ item.number_of_classes ? item.number_of_classes : '--' }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Days')" md-numeric>{{ item.days }}
                  </md-table-cell>
                  <md-table-cell>
                    <md-button @click="assignClassPassToCustomer(item)">{{ $t('global.Assign') }}</md-button>
                  </md-table-cell>
                </md-table-row>
              </md-table>
            </div>
          </md-list>
        </md-list-item>
      </md-list>
    </md-card>
  </div>
</template>

<script>

  import YogoApi from '../gateways/YogoApi'

  import moment from 'moment'

  export default {
    name: 'CustomerAddOptionsClassPassType',
    data() {
      return {
        accordionTitle: 'Tilføj adgangskort',
        classPassTypeNameLabel: 'Korttype',
        classPassTypeNumberOfClassesLabel: 'Antal klip',
        classPassTypeDaysLabel: 'Dage',
        classPassTypeStatus: 'Valg',
        classPassTypeStatusBtn: 'Tilføj',
        classPassTypes: [],
      }
    },
    props: ['customersClassPasses'],
    mounted() {
      this.fetchClassPassTypes()
    },
    methods: {
      async fetchClassPassTypes() {

        this.classPassTypes = await YogoApi.get('/class-pass-types')

      },
      async assignClassPassToCustomer(classPassType) {
        let newClassPassData = {
          class_pass_type: classPassType.id,
          user: this.$route.params.id,
        }

        const newClassPass = await YogoApi.post('/class-passes', newClassPassData)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: classPassType.name + ' ' + this.$t('global.wasCreatedForTheCustomer'),
        })

        this.$emit('newClassPass', newClassPass)

      },
    },
  }
</script>
