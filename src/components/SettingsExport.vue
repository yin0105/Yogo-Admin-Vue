<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Export') }}</h2>

      <div class="space8"></div>
      <p>
        {{ $t('global.ExportDataForTransferToOtherSystem') }}
      </p>
      <div>
        <md-button class="md-raised md-primary" @click="downloadExport">{{ $t('global.ExportData') }}</md-button>
      </div>

    </div>
  </div>
</template>

<script>

  import SettingsSubMenu from './SettingsSubMenu'

  import YogoApi from '@/gateways/YogoApi'
  import {mapGetters} from 'vuex'

  import downloadFile from '../helpers/downloadFile'


  export default {
    components: {
      SettingsSubMenu,
    },

    computed: {
      ...mapGetters([
        'client',
      ]),
    },

    methods: {

      async downloadExport() {

        const response = await YogoApi.post(
          '/reports/make-report-token',
          {
            export: 'client',
          },
        )

        const relativePath = '/export/client?reportToken=' + response.token

        downloadFile(relativePath)

      },
    },

  }

</script>

<style scoped lang="scss">

</style>
