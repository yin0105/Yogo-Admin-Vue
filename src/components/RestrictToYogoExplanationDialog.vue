<template>
  <div>

    <md-dialog :md-active.sync="showRestrictToYogoExplanationDialog">
      <md-dialog-title>"{{ $t('global.LimitToYOGO') }}"</md-dialog-title>
      <md-dialog-content>
        <p>
          {{ $t('global.videoLimitDesc1') }}
        </p>
        <p>
          {{ $t('global.videoLimitDesc2') }}
        </p>
        <p>
          {{ $t('global.videoLimitDesc3') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-raised" @click.prevent="showRestrictToYogoExplanationDialog = false">Ok</md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<script>

  export default {
    data() {
      return {
        showRestrictToYogoExplanationDialog: false
      }
    },
    methods: {
      open() {
        this.showRestrictToYogoExplanationDialog = true
      },
    }
  }

</script>

<style lang="scss" scoped>

  .md-dialog {
    z-index: 12;
  }

</style>
