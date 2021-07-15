<template>
  <div :style="{display: displayStyle}">
    <md-icon class="tooltip-max-width">
      info
      <md-tooltip md-direction="right">
        {{ tooltipText }}
      </md-tooltip>
    </md-icon>

  </div>
</template>


<script>
  export default {
    name: 'TooltipInfo',
    props: {
      tooltipText: String,
      displayStyle: {
        type: String,
        default: 'block',
      }
    }

  }
</script>

<style lang="scss" >
  .md-tooltip.md-tooltip-right {
    max-width: 300px;
    white-space: normal;
    height: auto;
  }
</style>
