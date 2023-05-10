<template>
    <v-list-item :value="index" density="compact" @click="showDialog = true" class="text-truncate">
        <template #default>
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
        <template #append>
          <v-btn v-if="record.type !== EVENT.OPENBROWSER" variant="text" icon @click.stop="removeRecord(index)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </template>
      </v-list-item>

      <v-dialog v-model="showDialog" fullscreen transition="dialog-bottom-transition">
        <v-card>
            <v-toolbar density="compact">
                <template #title>
                    {{EVENT_TYPE_TO_KOREAN[record.type]}}
                </template>
                <v-btn icon @click="showDialog = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
<!-- Dialog Contents-->
            <v-container class="pa-1" align="center">
                <v-card max-width="400" variant="text" class="pt-2">
                  <v-row v-if="record.type === EVENT.CLICK || record.type === EVENT.INPUT || record.type === EVENT.SELECT" align="center">
                      <v-col>
                        <v-list-group value align="center">
                        <template #activator="{ props }">
                          <v-list-item v-bind="props" title="엘리먼트 정보" prepend-icon="mdi-info"></v-list-item>
                        </template>
                        <v-list-item class="pa-0">
                          <template #default>
                            <v-row align="center">
                              <v-col cols="3">TAG</v-col>
                              <v-col cols="8">
                                <v-text-field readonly v-model="record.localName" density="compact" variant="outlined" hide-details></v-text-field>
                              </v-col>
                            </v-row>

                            <v-row align="center">
                              <v-col cols="3">ID</v-col>
                              <v-col cols="8">
                                <v-text-field readonly v-model="record.id" density="compact" variant="outlined" hide-details></v-text-field>
                              </v-col>
                            </v-row>

                            <v-row align="center">
                              <v-col cols="3">CLASS</v-col>
                              <v-col cols="8">
                                <v-text-field readonly v-model="record.class" density="compact" variant="outlined" hide-details></v-text-field>
                              </v-col>
                            </v-row>

                            <v-row align="center">
                              <v-col cols="3">NAME</v-col>
                              <v-col cols="8">
                                <v-text-field readonly v-model="record.name" density="compact" variant="outlined" hide-details></v-text-field>
                              </v-col>
                            </v-row>

                            <v-divider thickness="2" class="mt-2"></v-divider>
                          </template>
                        </v-list-item>
                      </v-list-group>
                      </v-col>
                  </v-row>

                  <v-row align="center" v-for="info in record.info">
                      <v-col cols="3" class="pa-0 text-center">
                          <span>{{ info.displayName }}</span>
                      </v-col>
                      <v-col cols="8" v-if="info.type === 'readonly'">
                          <v-text-field v-if="info.type === 'readonly'" v-model="record[info.value]" density="compact" variant="outlined" hide-details readonly></v-text-field>
                      </v-col>
                      <v-col cols="8" v-else-if="info.type === 'input'">
                          <v-text-field label="✏️" v-model="record[info.value]" density="compact" variant="outlined" hide-details></v-text-field>
                      </v-col>
                      <v-col cols="8" v-else-if="info.type === 'selectLocator'">
                          <v-select v-model="locatorDisplayName" variant="solo" density="compact" :items="info.values" item-title="displayName" item-value="type" hide-details @update:model-value="changeLocator"></v-select>
                          <v-text-field v-model="locatorValue" variant="outlined" density="compact" hide-details readonly></v-text-field>
                      </v-col>
                      <v-col cols="8" v-else-if="info.type === 'selectAttribute'">
                          <v-select v-model="attributeDisplayName" variant="solo" density="compact" :items="info.values" item-title="displayName" item-value="type" hide-details @update:model-value="changeAttribute"></v-select>
                          <v-text-field v-model="attributeValue" variant="outlined" density="compact" hide-details readonly></v-text-field>
                      </v-col>
                      <v-col cols="8" v-else-if="info.type === 'image'">
                        <v-img v-if="record.image" :src="record.image"/>
                        <span v-else>이미지가 없습니다.</span>
                      </v-col>
                      
                  </v-row>
                </v-card>
            </v-container>
        </v-card>
      </v-dialog>
</template>

<script setup lang="ts">

import { CapturedEventDetails, LocatorType } from '@CrxInterface';
import { EVENT, EVENT_TYPE_TO_KOREAN, CRX_ACTION } from '@CrxConstants';
import { ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const showDialog = ref(false);
const props = defineProps<{
  record : CapturedEventDetails,
  index : number
}>();
const locatorDisplayName = ref('XPath');
const locatorValue = ref(props.record.xpath);

const attributeDisplayName = ref('속성을 선택 해 주세요');
const attributeValue = ref('');

const removeRecord = (index : number) => {
  store.dispatch(CRX_ACTION.REMOVE_RECORD, index);
}

const editRecord = (index : number, record : CapturedEventDetails) => {
    store.dispatch(CRX_ACTION.EDIT_RECORD, {
        index : index,
        record : record
    });
}

const changeLocator = (locatorType : LocatorType) => {
  props.record.locator = {
    type : locatorType,
    value : props.record[locatorType]
  };
  locatorValue.value = props.record.locator.value;
}

const changeAttribute = (attributeType : LocatorType) => {
  props.record.attribute = {
    type : attributeType,
    value : props.record.info.find(item => item.type === 'selectAttribute').values.find(item => item.type === attributeType).val
  };
  attributeValue.value = props.record.attribute.value;
}

watch(showDialog, (newVal) => {
    if (newVal === true) return;
    editRecord(props.index, props.record);
});


</script>