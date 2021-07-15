<template>
  <span>
    <span
      v-for="(item, idx) in items"
      v-if="idx <= maxLines - 2"
    >
      {{ item }}<span v-if="idx < items.length - 1">,<br></span>
    </span>
    <span v-if="items.length === maxLines">
      {{ items[maxLines - 1] }}
    </span>
    <span v-if="items.length > maxLines">+ {{ items.length - (maxLines - 1) }} mere</span>
  </span>
</template>

<script>

  export default {
    props: {
      items: Array,
      maxLines: {
        default: 4,
      },
    },
  }

</script>
