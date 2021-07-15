<template>
  <md-field>
    <div class="color__picker--container">
      <p>{{ label }}</p>
      <div
        id="trigger_color"
        v-click-outside="hide"
        @click="toggle"
        class="color__picker--circle"
        v-bind:style="{ background: previewColor }"
      >
      </div>
      <chrome-picker
        v-model="colorPickerValue"
        v-show="showColorPicker"
        @input="colorPickerInput"
        ref="colorPicker"
      >
      </chrome-picker>
    </div>
  </md-field>
</template>


<script>

  import {Chrome} from 'vue-color'
  import ClickOutside from 'vue-click-outside'

  export default {
    name: 'colorpickerfield',
    components: {
      'chrome-picker': Chrome,
    },
    props: {
      color: {
        default: '#194d33',
      },
      label: {
        default: 'Color',
      },
    },
    data() {
      return {
        colorPickerValue: this.color ? this.color : '#194d33',
        previewColor: this.color ? this.color : '#194d33',
        showColorPicker: false,
      }
    },
    watch: {
      color(newColor) {
        this.colorPickerValue = newColor
        this.previewColor = newColor
        this.$forceUpdate()
      },
    },
    mounted: function () {
      // prevent click outside event with popupItem.
      this.popupItem = this.$refs.colorPicker.$el
    },
    directives: {
      ClickOutside,
    },
    methods: {
      colorPickerInput: function (response) {
        this.previewColor = response.hex
        this.$emit('update:color', response.hex)
      },
      toggle() {
        this.showColorPicker = true
      },

      hide() {
        this.showColorPicker = false
      },
    },
  }

</script>


<style lang="stylus">

  .vc-chrome
    position absolute
    right 0
    z-index 8999

</style>
