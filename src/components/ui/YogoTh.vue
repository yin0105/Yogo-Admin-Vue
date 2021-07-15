<template>
  <th class="md-table-head" @click="$emit('click')">
    <div class="md-table-head-container">
      <div class="md-table-head-label">
        <slot></slot>
      </div>
    </div>
  </th>
</template>

<script>

export default {
  name: 'YogoTh',
};

</script>
