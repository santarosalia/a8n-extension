<template>
    <v-container fluid>
      <span v-if="scrapingDatasForTable.textData.length === 0">스크래핑 데이터가 없습니다</span>
      <v-table v-else density="compact">
        <tbody align="center">
          <tr>
            <td></td>
            <td v-for="i in scrapingDatasForTable.columnSize.reduce((a, b) => a + b)">
              <span v-if="!scrapingDatasForTable.exceptColumn[getColIdx(i-1)].includes(getCurrentIdx(i-1))">
              <v-btn icon variant="text" density="comfortable" @click="removeColumn(i)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </span>
            </td>
          </tr>
          <tr v-for="tr,trIdx in scrapingDatasForTable.textData">
            <td v-if="!scrapingDatas.exceptRow.includes(trIdx)">
              <v-btn icon variant="text" density="comfortable" @click="removeRow(trIdx)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </td>
            <td v-for="td,tdIdx in tr" class="text-truncate" :title="td" v-if="!scrapingDatas.exceptRow.includes(trIdx)">
            <span v-if="!scrapingDatasForTable.exceptColumn[getColIdx(tdIdx)].includes(getCurrentIdx(tdIdx))">{{ td }}</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
    <v-dialog v-model="multiPageDialog" height="400" max-width="350" max-height="500">   
      <v-card height="100%">
        <template #title>
          다중 페이지 설정
        </template>
        <template #append>
          <v-btn icon variant="text" @click="multiPageDialogClose" location="bottom" class="">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        </template>
        <v-divider></v-divider>
        <v-card-item>
          <v-label class="ma-1">페이지 수 설정</v-label>
        </v-card-item>
        <v-card-item>
          <v-radio-group density="compact" inline v-model="pageRadio" hide-details>
          <v-radio label="전체 페이지" :value="1"></v-radio>
          <v-radio label="페이지 수" :value="2"></v-radio>
          <v-fade-transition>
            <v-text-field v-if="pageRadio === 2" variant="outlined" density="compact" hide-details v-model="multiPageCount" type="number" style="width: 10px;"></v-text-field>
          </v-fade-transition>   
        </v-radio-group>
        </v-card-item>
        <br>
        <v-divider></v-divider>

        <v-card-item>
          <v-label class="ma-1">다음 페이지 선택 방법</v-label>
          <v-tooltip text="페이지에서 우클릭하여 버튼을 선택 해 주세요." location="top">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" variant="text" icon>
                <v-icon>mdi-help-circle-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          
          <!-- <v-img :src="example"></v-img> -->
        </v-card-item>

        <v-card-item>
          
          <span class="v-label ml-1">다음 페이지 버튼</span>

          <v-btn-group class="ml-2" density="compact">
            <v-btn v-if="nextPageButton === null" variant="outlined">없음</v-btn>
            <v-btn v-else variant="outlined" color="red" @click="resetNextPageButton">취소</v-btn>
          </v-btn-group>


          <span class="v-label ml-1">숫자 페이지 버튼</span>

          <v-btn-group class="ml-2" density="compact">
            <v-btn v-if="nextPageNumber === null" variant="outlined">없음</v-btn>
            <v-btn v-else variant="outlined" color="red" @click="resetNumberPageButton">취소</v-btn>
          </v-btn-group>
        </v-card-item>

          
        <v-btn variant="text" color="info" location="bottom end" position="absolute" @click="saveMultiPage">완료</v-btn>

      </v-card>
    </v-dialog>
  </template>
  
<script lang="ts" setup>
import { useStore } from 'vuex'
import { ScrapingDatas, CRX_CONTEXT_MENU_TYPE } from '@CrxInterface'
import { ref, watch, computed } from 'vue';
import { CRX_STATE, CRX_ACTION } from '@CrxConstants'

const store = useStore();

const multiPageDialog = ref(false);
const multiPageCount = ref(0);
const getMultiPageDialog = computed(() => store.getters[CRX_STATE.CRX_DIALOG_STATE.CRX_MULTI_PAGE_DIALOG]);
const pageRadio = ref(1);
const nextPageButton = computed(() => store.getters[CRX_STATE.CRX_NEXT_PAGE_BUTTON]);
const nextPageNumber = computed(() => store.getters[CRX_STATE.CRX_NEXT_PAGE_NUMBER]);
const resetNextPageButton = () => {
  store.commit(CRX_STATE.CRX_NEXT_PAGE_BUTTON, null);
}
const resetNumberPageButton = () => {
  store.commit(CRX_STATE.CRX_NEXT_PAGE_NUMBER, null);
}
const multiPageDialogClose = () => {
  store.commit(CRX_STATE.CRX_DIALOG_STATE.CRX_MULTI_PAGE_DIALOG, false);
}

const scrapingDatas = computed(() : ScrapingDatas => store.getters[CRX_STATE.CRX_SCRAPING_DATAS]);
const scrapingDatasForTable = computed(() => {
  const scrapingDatas : ScrapingDatas = store.getters[CRX_STATE.CRX_SCRAPING_DATAS];
  let textData :string[][] = [];

  scrapingDatas.data.reverse().forEach(item => {
    textData = item.textData.map((arr,idx) => arr.concat(textData[idx]))
  });

  const result = {
    columnSize : scrapingDatas.data.map(item => item.columnSize).reverse(),
    textData : textData,
    pattern : scrapingDatas.data.map(item => item.pattern).reverse(),
    exceptColumn : scrapingDatas.data.map(item => item.exceptColumn).reverse(),
  }
  return result;
});

const removeRow = (idx : number) => {
  store.dispatch(CRX_ACTION.REMOVE_ROW, idx)
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
  store.dispatch(CRX_ACTION.REMOVE_COLUMN, {
    colIdx : colIdx,
    removeIdx : idx-1
  });
}

const getColIdx = (idx : number) => {
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
  return colIdx;
}

const getCurrentIdx = (idx : number) => {
  const colSize = scrapingDatasForTable.value.columnSize;
  for (let i in colSize) {
    if (colSize[i] < idx) {
      idx -= colSize[i];
    } else {
      break;
    }
  }
  return idx;
}

const saveMultiPage = () => {
  let pageCnt :string | number;
  if (pageRadio.value === 1) {
    pageCnt = '*';
  } else {
    pageCnt = multiPageCount.value;
  }
  store.commit(CRX_STATE.CRX_PAGE_COUNT, pageCnt);
  if (store.getters[CRX_STATE.CRX_NEXT_PAGE_BUTTON] || store.getters[CRX_STATE.CRX_NEXT_PAGE_NUMBER]) {
    store.commit(CRX_STATE.CRX_IS_MULTI_PAGE, true);
  } else {
    store.commit(CRX_STATE.CRX_IS_MULTI_PAGE, false);
  }
  multiPageDialog.value = false;
}

watch(getMultiPageDialog, newVal => {
  multiPageDialog.value = newVal;
});

watch(multiPageDialog, newVal => {
  store.commit(CRX_STATE.CRX_DIALOG_STATE.CRX_MULTI_PAGE_DIALOG, newVal);

  if (newVal === true) {
    store.dispatch(CRX_ACTION.CONTEXT_MENU_CHANGE, CRX_CONTEXT_MENU_TYPE.MULTIPAGE);
  } else {
    store.dispatch(CRX_ACTION.CONTEXT_MENU_CHANGE, CRX_CONTEXT_MENU_TYPE.NORMAL);
  }
});

watch(multiPageCount, (newVal, oldVal) => {
  if (isNaN(newVal) || newVal < 0) multiPageCount.value = oldVal;
});
</script>
  