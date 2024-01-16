<script setup>
import { ref } from "vue";
import NavBarLayout from "./NavBarLayout.vue";
import SideBarLayout from "./SideBarLayout.vue";
import ContentLayout from "./ContentLayout.vue";

// Variables
const sideBarOpen = ref(true);

// Metodos
const toggleSideBar = () => {
  sideBarOpen.value = !sideBarOpen.value;
};
</script>

<template>
  <q-layout view="lHh LpR lFf">
    <NavBarLayout @toggleSideBar="toggleSideBar" />
    <SideBarLayout
      v-model="sideBarOpen"
      :key="sideBarOpen"
      @toggleSideBar="toggleSideBar"
    />
    <ContentLayout />
  </q-layout>
</template>
