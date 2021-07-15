<template>

  <classtypeform :formType="'edit'"></classtypeform>

</template>

<script>

    import ClassTypeForm from "./ClassTypeForm";

    export default {
        name: 'classtypeedit',
        components: {
            classtypeform: ClassTypeForm,
        },
    }
</script>

