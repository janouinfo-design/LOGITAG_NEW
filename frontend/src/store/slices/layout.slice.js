import { createSlice, createAction, createAsyncThunk } from "@reduxjs/toolkit";

import { LAYOUT_SLICE as slice_name } from "./names.js";

export const search = createAsyncThunk(`${slice_name}/onSearch`, async (args, { getState }) => {
  let { filterAction, filterValues } = getState()[slice_name]
  if (typeof filterAction == 'function') filterAction(filterValues)
})

export const setLayoutParams = createAction(`${slice_name}/setParams`);
export const setCurrentPage = createAction(`${slice_name}/setCurrentPage`);
export const setFilterList = createAction(`${slice_name}/setFilterList`);
export const setFilterValues = createAction(`${slice_name}/setFilterValues`);
export const setFilterAction = createAction(`${slice_name}/setFilterAction`);
export const setDefaultRoot = createAction(`${slice_name}/setDefaultRoot`);

export const getLayoutParams = (state) => state[slice_name].params;
export const getCurrentPage = (state) => state[slice_name].currentPage;
export const getFilterList = (state) => state[slice_name].filterList;
export const getFilterValues = (state) => state[slice_name].filterValues;
export const getDefaultRoot = (state) => state[slice_name].defaultRoot;

export const layoutSlice = createSlice({
  initialState: {
    params: {
      asideMinimized: true,
      asideWidth: "70",
      asideMinWidth: "70",
      asideMaxWidth: "270",
      showLoader: false,
      toast: {}
    },
    defaultRoot: '/tasks',
    currentPage: { label: "Les taches" },
    filterList: [
      { label: "status", type: "select", data: [{ label: "En cours", value: "2" }, { label: "En attente", value: "3" }] },
      { label: "debut", name: 'begDate', type: "date" },
      { label: "fin", name: 'endDate', type: "date" },
    ],
    filterValues: {},
    filterAction: () => {
           
    },
    subHeader: {
      filterActions: (<div><button>OOO</button></div>),
    }
  },
  name: slice_name,
  reducers: {},
  extraReducers: {
    [setLayoutParams]: (state, { payload }) => {
      state.params = { ...state.params, ...payload };
      state.params.asideWidth = state.params.asideMinimized ? state.params.asideMinWidth : state.params.asideMaxWidth
    },
    [setCurrentPage]: (state, { payload }) => {
      state.currentPage = payload
    },
    [setFilterList]: (state, { payload }) => {
      state.filterList = payload
    },
    [setFilterValues]: (state, { payload }) => {
      state.filterValues = payload
    },
    [setFilterAction]: (state, { payload }) => {
      state.filterAction = payload
    },
    [setDefaultRoot]: (state, { payload }) => {
      state.defaultRoot = payload
    }
  },
});



export default layoutSlice.reducer;
