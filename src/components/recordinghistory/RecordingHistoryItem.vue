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
            <v-icon>mdi-minus</v-icon>
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
            <v-container align="center" class="pa-1">
                <v-card max-width="400" variant="text">
                    <v-row align="center" v-for="info in record.info">
                        <v-col cols="2" class="pa-0 text-center">
                            <span>{{ info.title }}</span>
                        </v-col>

                        <v-col v-if="info.type === 'readonly'">
                            <v-text-field v-if="info.type === 'readonly'" v-model="record[info.value]" density="compact" variant="outlined" hide-details readonly></v-text-field>
                        </v-col>
                        <v-col v-else-if="info.type === 'input'">
                            <v-text-field v-model="record[info.value]" density="compact" variant="outlined" hide-details></v-text-field>
                        </v-col>
                        
                    </v-row>
                </v-card>
            </v-container>
        </v-card>
      </v-dialog>
</template>

<script setup lang="ts">

import { CapturedEventDetails } from '@CrxInterface';
import { EVENT, EVENT_TYPE_TO_KOREAN } from '@CrxConstants';
import { ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const showDialog = ref(false);

const props = defineProps<{
    record : CapturedEventDetails,
    index : number
}>();

const removeRecord = (index : number) => {
    store.dispatch('removeRecord', index);
}

const editRecord = (index : number, record : CapturedEventDetails) => {
    store.dispatch('editRecord', {
        index : index,
        record : record
    });
}

watch(showDialog, (newVal) =>{
    if (newVal === true) return;
    editRecord(props.index, props.record);
});
</script>