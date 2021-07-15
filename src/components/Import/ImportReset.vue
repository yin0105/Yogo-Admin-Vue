<template>
  <div>
    <div class="space8"></div>
    <h2>Nulstil import</h2>
    <div>
      <md-button class="md-raised md-primary" @click="resetImport">Nulstil import (BRUG MED
        OMTANKE!!)
      </md-button>
    </div>
  </div>
</template>

<script>

  import YogoApi from '../../gateways/YogoApi'

  export default {
    name: 'ImportReset',
    methods: {
      async resetImport() {
        if (!confirm('Er du helt sikker på at du vil slette alle\n- class_passes\n- class_signups\n- memberships\n- membership_logs\n- event-signups\n- alle brugere, der ikke er admins, undervisere eller checkin\n??????\nDette berører IKKE nødvendigvis KUN sidste import, men alle kunder i systemet!!')) return
        if (!confirm('Er du helt sikker? Kunder, adgangskort, medlemskaber og tilmeldinger til hold og events bliver slettet, ikke blot arkiveret. De kan ikke gendannes!')) return
        this.loading = true
        await YogoApi.post('/import/reset-import')
        this.loading = false

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: 'Importen er fjernet',
        })

      },
    },
  }
</script>
