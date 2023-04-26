<template>
    <v-container fluid>
      <span v-if="scrapingDatasForTable.textData.length === 0">스크래핑 데이터가 없습니다</span>
      <v-table v-else density="compact">
        <tbody align="center">
          <tr>
            <td></td>
            <td v-for="i in scrapingDatasForTable.columnSize.reduce((a, b) => a + b)">
              <v-btn icon variant="text" density="comfortable" @click="removeColumn(i)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </td>
          </tr>
          <tr v-for="tr,trIdx in scrapingDatasForTable.textData">
            <td>
              <v-btn icon variant="text" density="comfortable" @click="removeRow(trIdx)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </td>
            <td v-for="td in tr" class="text-truncate" :title="td">
            {{ td }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
  </template>
  
<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { ScrapingDatas } from '@CrxInterface'


const store = useStore();

// const scrapingDatas = computed(() : ScrapingDatas => store.getters['getScrapingDatas']);

const scrapingDatasForTable = computed(() => {
  const scrapingDatas : ScrapingDatas = store.getters['getScrapingDatas'];
  let textData = [];

  scrapingDatas.data.reverse().forEach(item => {
    textData = item.textData.map((arr,idx) => arr.concat(textData[idx]))
  });

  const result = {
    columnSize : scrapingDatas.data.map(item => item.columnSize).reverse(),
    textData : textData,
    pattern : scrapingDatas.data.map(item => item.pattern).reverse(),
    exceptColumn : scrapingDatas.data.map(item => item.exceptColumn).reverse()
  }
  return result;
});

const removeRow = (idx : number) => {
  console.log(idx)
}

const removeColumn = (idx : number) => {
  let colIdx : number;
  const colSize = scrapingDatasForTable.value.columnSize;
  for (let i in colSize) {
    if (colSize[i] < idx) {
      idx -= colSize[i];
    } else {
      colIdx = Number(i);
      break;
    }
  }
  store.dispatch('removeColumn', {
    colIdx : colIdx,
    removeIdx : idx
  });
}

</script>
  