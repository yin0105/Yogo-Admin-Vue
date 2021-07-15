<template>
  <md-dialog :md-active.sync="showWebsiteCodeDialog">
    <md-dialog-title>{{ $t('global.CodeForWebsite') }}</md-dialog-title>
    <md-dialog-content>
      <md-field>
        <md-textarea v-model="websiteCodeDialogTextarea"></md-textarea>
      </md-field>
      <md-button class="md-primary md-raised"
                 v-clipboard:copy="websiteCodeDialogTextarea"
                 v-clipboard:success="onCopyCodeSuccess"
                 v-clipboard:error="onCopyCodeError">{{ $t('global.CopyToClipboard') }}
      </md-button>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button @click="showWebsiteCodeDialog = false">{{ $t('global.Close') }}</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>

  export default {
    data() {
      return {
        showWebsiteCodeDialog: false,
        websiteCodeDialogTextarea: ''
      }
    },
    methods: {
      open(code) {
        this.websiteCodeDialogTextarea = code
        this.showWebsiteCodeDialog = true
      },
      onCopyCodeSuccess() {
        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.CodeHasBeenCopied'),
        })
        this.showWebsiteCodeDialog = false
      },

      onCopyCodeError() {
        alert(this.$t('global.CouldNotCopyErrorDesc'))
      },
    }
  }

</script>
