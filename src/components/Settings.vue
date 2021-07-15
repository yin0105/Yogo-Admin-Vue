<template>
  <div>
    <SettingsSubmenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">
      <SettingsAppearance></SettingsAppearance>
    </div>

  </div>
</template>

<script>

  import SettingsSubMenu from './SettingsSubMenu'
  import SettingsAppearance from './SettingsAppearance'
  import SettingsSubmenu from "./SettingsSubMenu"

  export default {
    name: 'Settings',
    components: {
      SettingsSubmenu,
      SettingsSubMenu,
      SettingsAppearance
    },
  }
</script>
