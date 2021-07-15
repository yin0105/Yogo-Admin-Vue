<template>
  <td class="md-table-cell">
    <div class="md-table-cell-container">
      <slot></slot>
    </div>
  </td>
</template>

<script>

export default {
  name: 'YogoTd',
};

</script>
<style lang="scss" scoped>

  td {
    border-top: 1px solid rgba(0, 0, 0, 0.12) !important;
  }
</style>
