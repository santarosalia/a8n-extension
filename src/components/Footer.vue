<template>
    <v-bottom-navigation>
        <v-btn @click="recordingWindowFocus">
            <v-icon>mdi-map-marker</v-icon>
            레코딩 창
        </v-btn>
        <v-btn>
            <v-icon>mdi-inbox-arrow-up</v-icon>
            저장
        </v-btn>
    </v-bottom-navigation>

</template>
  
<script lang="ts" setup>
import { useStore } from 'vuex';

const store = useStore();

const recordingWindowFocus = () => {
    store.dispatch('recordingWindowFocus');
}
</script>
  