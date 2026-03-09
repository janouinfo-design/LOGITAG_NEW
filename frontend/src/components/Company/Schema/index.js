import * as yup from 'yup'

export const navixyValidation = yup.object().shape({
  email: yup.string().email('please enter a valid email').required('Required'),
  password: yup.string().required('Required'),
})
