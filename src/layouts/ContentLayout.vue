<style lang="scss" scope>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <q-page-container class="bg-grey-4">
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <Suspense timeout="0">
          <div>
            <component :is="Component" />
          </div>
          <!-- carga del pre-loader -->
          <template #fallback>
            <div>
            <q-page padding>
              <div class="flex flex-center q-mt-lg q-pt-lg">
                <q-spinner-cube color="primary" size="5em" />
                <h4 class="q-ml-md">Cargando...</h4>
              </div>
            </q-page>
            </div>
          </template>
        </Suspense>
      </Transition>
    </router-view>
  </q-page-container>
</template>
