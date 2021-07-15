<template>

  <classform :formType="'edit'"></classform>

</template>

<script>

    import Classform from "./ClassForm.vue";

    export default {
        name: 'classedit',
        components: {
            Classform,
        },
    }
</script>