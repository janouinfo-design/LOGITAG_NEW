import * as yup from 'yup'

export const addressSchema = yup.object().shape({
  number: yup
    .string()
    .required('Phone number is required')
    .matches(
      /^([0]{1}|\+?[234]{3})([7-9]{1})([0|1]{1})([\d]{1})([\d]{7})$/g,
      'Invalid phone number'
    ),
})
