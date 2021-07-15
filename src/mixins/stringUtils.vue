<template>
  <div></div>
</template>

<script>


export default {

  methods: {
    stringExcerpt(str, maxLength) {
      maxLength = maxLength || 100;
      if (str.length <= maxLength) return str;
      const lastSpacePos = str.substr(0,100).lastIndexOf(' ');
      return str.substr(0,lastSpacePos) + '...';
    }
  },
};

</script>
