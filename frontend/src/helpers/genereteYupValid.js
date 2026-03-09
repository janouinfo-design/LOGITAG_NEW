import * as Yup from 'yup'

export const generateYupSchema = (validationArray) => {
  if (!Array.isArray(validationArray)) return

  let schema = {}

  validationArray.forEach((rule) => {
    const {id, label, isRequired, messageError, max, min, regExp} = rule
    if (isRequired === 1 && rule.active) {
      let yupChain = Yup.string().required(messageError || `${label} is required`)
      if (max > 0) {
        yupChain = yupChain.max(max, `Maximum length exceeded (max: ${max})`)
      }
      if (min > 0) {
        yupChain = yupChain.min(min, `Minimum length not met (min: ${min})`)
      }
      if (regExp) {
        yupChain = yupChain.matches(new RegExp(regExp), 'Invalid format')
      }
      schema[id] = yupChain
    }
  })

  return Yup.object().shape(schema)
}
