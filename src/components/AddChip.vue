<template>
  <div>
    <md-chips v-model="chipName" :md-placeholder="placeholder" :md-limit="limit"></md-chips>
  </div>
</template>

<script>

  export default {
    name: 'AddChip',
    components: {
    },
    data: () => ({

    }),
    props: [
    'placeholder',
    'chipName',
    'limit'
    ]
  }
</script>
