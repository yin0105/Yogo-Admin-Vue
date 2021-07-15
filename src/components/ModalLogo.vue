<template>
  <img :src="imgSrc" alt="" :class="imgClass" v-if="imageType">
</template>

<script>

  import Imgix from '@/services/Imgix'
  import {mapGetters} from 'vuex'

  export default {
    props: {},
    computed: {
      ...mapGetters([
        'client',
      ]),
      imageType() {
        if (!this.client || !this.client.logo_white) return null
        return this.client.logo_white.filename.slice(-4) === '.svg' ? 'svg' : 'bitmap'
      },
      imgSrc() {
        if (!this.client || !this.client.logo_white) return ''
        return this.imageType === 'svg' ?
          Imgix.methods.Imgix(this.client.logo_white.filename) :
          Imgix.methods.Imgix(this.client.logo_white.filename, {w: 400, h: 200})
      },
      imgClass() {
        return this.imageType === 'svg' ?
          'logo-svg' :
          'logo-bitmap'
      },
    },
  }

</script>
