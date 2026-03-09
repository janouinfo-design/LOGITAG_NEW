import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {_fetchLangs, _saveLang} from '../api'
import _ from 'lodash'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

export const name = 'olang'

export const fetchLangs = createAsyncThunk(
  `${name}/fetchLangs`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchLangs()
    if (!response.error) dispatch(setLangs(response.result))
  }
)

export const createOrUpdateLang = createAsyncThunk(
  `${name}/createOrUpdateLang`,
  async (_args, {dispatch, getState}) => {
    try {
      _args.code = _args.code.toLowerCase()
      let res = await _saveLang(_args)

      if ((res?.result?.[0]?.message || '').toLowerCase() == 'saved') {
        let {langs, currentLang} = _.cloneDeep(getState()[name])
        langs[currentLang][_args.code] = _args.text
        dispatch(setLangs(langs))

        dispatch(setLangEditParams({show: false}))
        return {sucess: true}
      }
      return {success: false, error: res.result}
    } catch (e) {
      return {success: false, message: e.message}
    }
  }
)

export const getLangs = (state) => state[name].langs
export const getCurrentLang = (state) => state[name].currentLang
export const getEditLang = (state) => state[name].editLang
export const getLanguages = (state) => state[name].languages
export const getLangEditParams = (state) => state[name].editParams

const langslice = createSlice({
  name,
  initialState: {
    langs: {},
    currentLang: localStorage.getItem('lang') || 'fr',
    editLang: false,
    editParams: {
      show: false,
      code: '',
      text: '',
    },
    lang: 'fr',
    languages: [
      {
        lang: 'en',
        name: 'English',
        flag: toAbsoluteUrl('/media/flags/united-states.svg'),
      },
      {
        lang: 'fr',
        name: 'French',
        flag: toAbsoluteUrl('/media/flags/france.svg'),
      },
      {
        lang: 'de',
        name: 'German',
        flag: toAbsoluteUrl('/media/flags/germany.svg'),
      },

      // {
      //   lang: 'zh',
      //   name: 'Mandarin',
      //   flag: toAbsoluteUrl('/media/flags/china.svg'),
      // },
      // {
      //   lang: 'es',
      //   name: 'Spanish',
      //   flag: toAbsoluteUrl('/media/flags/spain.svg'),
      // },
      // {
      //   lang: 'ja',
      //   name: 'Japanese',
      //   flag: toAbsoluteUrl('/media/flags/japan.svg'),
      // },
    ],
  },
  reducers: {
    setLangEditParams: (state, {payload}) => {
      state.editParams = payload
    },
    setLangs: (state, {payload}) => {
      state.langs = payload
    },
    setCurrentLang: (state, {payload}) => {
      state.currentLang = payload
      localStorage.setItem('lang', payload)
    },
    setEditLang: (state, {payload}) => {
      state.editLang = payload
    },
  },
  extraReducers: {},
})

export const {setLangEditParams, setLangs, setCurrentLang, setEditLang} = langslice.actions

export default langslice.reducer
