import { createSlice } from "@reduxjs/toolkit";

const slice_name = 'ui'

export const uiSlice = createSlice({
  initialState: {
    toastParams: null,
    defaultsParams: {
      success: {
        summary: "SUCCES", detail: "Opération réussi !!!"
      },
      error: {
        summary: "ERREUR", detail: "Opération échoué. Veuillez réessayer !!!"
      },
      warn: {
        summary: "INFO"
      },
    }
  },
  name: slice_name,
  reducers: {
    setToastParams: (state, { payload }) => {
      if (payload.severity && payload.severity in state.defaultsParams) {
        for (const key in state.defaultsParams[payload.severity]) {
          payload[key] = payload[key] || state.defaultsParams[payload.severity][key]
        }
      }

      state.toastParams = { ...state.toastParams, ...payload };
    },
  }
  
});


export const {
  setToastParams
} =  uiSlice.actions

export const getToastParams = (state) => state[slice_name].toastParams;

export default uiSlice.reducer;
