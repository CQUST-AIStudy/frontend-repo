import { reactive } from 'vue'

export function useFormValidation(rules) {
  const errors = reactive({})

  function validate(model) {
    let valid = true
    Object.keys(errors).forEach(k => delete errors[k])

    for (const field in rules) {
      const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]]
      const value = model[field]

      for (const rule of fieldRules) {
        if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
          errors[field] = rule.message || `${field} 不能为空`
          valid = false
          break
        }
        if (rule.min && typeof value === 'string' && value.length < rule.min) {
          errors[field] = rule.message || `最少 ${rule.min} 个字符`
          valid = false
          break
        }
        if (rule.max && typeof value === 'string' && value.length > rule.max) {
          errors[field] = rule.message || `最多 ${rule.max} 个字符`
          valid = false
          break
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors[field] = rule.message || `格式不正确`
          valid = false
          break
        }
        if (rule.validator) {
          const err = rule.validator(value, model)
          if (err) {
            errors[field] = err
            valid = false
            break
          }
        }
      }
    }
    return valid
  }

  function validateField(field, value, model) {
    delete errors[field]
    const fieldRules = rules[field]
    if (!fieldRules) return true

    const ruleList = Array.isArray(fieldRules) ? fieldRules : [fieldRules]
    for (const rule of ruleList) {
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = rule.message || `${field} 不能为空`
        return false
      }
      if (rule.min && typeof value === 'string' && value.length < rule.min) {
        errors[field] = rule.message || `最少 ${rule.min} 个字符`
        return false
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || `格式不正确`
        return false
      }
      if (rule.validator) {
        const err = rule.validator(value, model)
        if (err) {
          errors[field] = err
          return false
        }
      }
    }
    return true
  }

  function resetFields() {
    Object.keys(errors).forEach(k => delete errors[k])
  }

  function clearField(field) {
    delete errors[field]
  }

  return { errors, validate, validateField, resetFields, clearField }
}
