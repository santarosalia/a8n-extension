<template>
    <v-list-item :value="index" density="compact" @click="showDialog = true" class="text-truncate">
        <template v-slot:default>
          {{EVENT_TYPE_TO_KOREAN[record.type]}}

          <br>

          <span v-if="record.localName">
            Tag : {{ record.localName }}
          </span>
          <span v-else-if="record.type === EVENT.OPENBROWSER">
            URL : {{ record.value }}
          </span>

          <span v-if="record.type === EVENT.INPUT || record.type === EVENT.SELECT">
            Value : {{ record.value }}
          </span>
          <span v-else-if="record.type === EVENT.CLICK">
            Text : {{ record.value ?? record.textContent }}
          </span>
          <span v-else-if="record.type === EVENT.MOVETAB">
            Tab Index : {{ record.value }}
          </span>
          <span v-else-if="record.type === EVENT.SWITCHFRAME">
            <span v-for="frame in record.frameStack">
              Frame {{ frame.frameIndex }} :
              {{ frame.id ?? frame.name }}
            </span>
          </span>
        </template>
        <template v-slot:append>
          <v-btn v-if="record.type !== EVENT.OPENBROWSER" variant="text" icon @click.stop="removeRecord(index)">
            <v-icon icon="mdi-minus"></v-icon>
          </v-btn>
        </template>
      </v-list-item>
      
      <v-dialog v-model="showDialog" fullscreen transition="dialog-bottom-transition">
        <v-card>
            <v-toolbar density="compact">
                <template v-slot:title>
                    {{EVENT_TYPE_TO_KOREAN[record.type]}}
                </template>
                <v-btn icon @click="showDialog = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
<!-- Dialog Contents-->
            <v-container>
                
            </v-container>
        </v-card>
      </v-dialog>
</template>

<script setup lang="ts">

import { CapturedEventDetails } from '@/ts/interface/CrxInterface';
import { EVENT, EVENT_TYPE_TO_KOREAN } from '@CrxConstants';
import { ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const showDialog = ref(false);

defineProps<{
    record : CapturedEventDetails,
    index : number
}>();


const removeRecord = (index : number) => {
    store.dispatch('removeRecord', index);
}
</script>