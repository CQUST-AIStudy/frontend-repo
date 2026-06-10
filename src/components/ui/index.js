import { Teleport, Transition, computed, defineComponent, h, inject, nextTick, onMounted, onUnmounted, provide, reactive, ref, resolveComponent, watch } from 'vue'
import { RouterLink } from 'vue-router'

const radioGroupKey = Symbol('ui-radio-group')
const checkboxGroupKey = Symbol('ui-checkbox-group')
const dropdownKey = Symbol('ui-dropdown')
const formKey = Symbol('ui-form')

function cls(...items) {
  return items.flat(Infinity).filter(Boolean).join(' ')
}

function normalizeType(type) {
  if (!type || type === 'button' || type === 'submit' || type === 'reset') return 'default'
  if (type === 'success') return 'success'
  if (type === 'warning') return 'warning'
  if (type === 'danger' || type === 'error') return 'danger'
  if (type === 'info') return 'info'
  if (type === 'primary') return 'primary'
  return 'default'
}

function callSlot(slot, props = {}) {
  return slot ? slot(props) : []
}

function flattenVNodes(vnodes = []) {
  return vnodes.flatMap((vnode) => {
    if (Array.isArray(vnode)) return flattenVNodes(vnode)
    if (vnode?.type === Symbol.for('v-fgt')) return flattenVNodes(vnode.children || [])
    return vnode ? [vnode] : []
  })
}

function getVNodeText(vnode) {
  if (typeof vnode === 'string') return vnode
  if (Array.isArray(vnode?.children)) return vnode.children.map(getVNodeText).join('')
  if (typeof vnode?.children === 'string') return vnode.children
  return ''
}

function toKebabProps(props = {}) {
  return Object.entries(props).reduce((acc, [key, value]) => {
    acc[key] = value
    acc[key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)] = value
    return acc
  }, {})
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]))
  return value
}

function getValueByPath(source, path) {
  return String(path || '').split('.').reduce((value, key) => value?.[key], source)
}

function setValueByPath(source, path, value) {
  const keys = String(path || '').split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((item, key) => item?.[key], source)
  if (target && lastKey) target[lastKey] = cloneValue(value)
}

function normalizeRules(rules) {
  if (!rules) return []
  return Array.isArray(rules) ? rules : [rules]
}

function isEmptyValue(value) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

function valueSize(value) {
  if (typeof value === 'number') return value
  if (Array.isArray(value)) return value.length
  return String(value ?? '').length
}

function resolveValidationError(error, fallback) {
  if (!error) return fallback
  if (error instanceof Error) return error.message || fallback
  return String(error)
}

function runCustomValidator(rule, value, model) {
  if (typeof rule.validator !== 'function') return Promise.resolve()

  return new Promise((resolve, reject) => {
    let settled = false
    const done = (error) => {
      if (settled) return
      settled = true
      error ? reject(error) : resolve()
    }

    try {
      const result = rule.validator(rule, value, done, model)
      if (result?.then) {
        result.then(() => done()).catch(done)
        return
      }
      if (rule.validator.length < 3) {
        if (result === false) done(rule.message || '校验失败')
        else if (result instanceof Error || typeof result === 'string') done(result)
        else done()
      }
    } catch (error) {
      done(error)
    }
  })
}

async function validateRule(rule, value, model) {
  if (rule.required && isEmptyValue(value)) {
    throw new Error(rule.message || '该项为必填项')
  }

  if (isEmptyValue(value)) return

  if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
    throw new Error(rule.message || '邮箱格式不正确')
  }

  if (rule.pattern && !rule.pattern.test(String(value))) {
    throw new Error(rule.message || '格式不正确')
  }

  const size = valueSize(value)
  if (rule.len !== undefined && size !== rule.len) {
    throw new Error(rule.message || `长度应为 ${rule.len}`)
  }

  if (rule.min !== undefined && size < rule.min) {
    throw new Error(rule.message || `长度不能少于 ${rule.min}`)
  }

  if (rule.max !== undefined && size > rule.max) {
    throw new Error(rule.message || `长度不能超过 ${rule.max}`)
  }

  await runCustomValidator(rule, value, model)
}

const buttonBase = 'ui-button inline-flex items-center justify-center gap-2 min-h-9 px-3.5 py-2 rounded-lg border text-[14px] font-medium leading-none transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
const buttonTypes = {
  default: 'border-[#d9e2ec] bg-white text-[#334155] hover:enabled:border-[#b8c7d6] hover:enabled:bg-[#f8fafc]',
  primary: 'border-[#007aff] bg-[#007aff] text-white shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:enabled:border-[#0056b3] hover:enabled:bg-[#0056b3]',
  success: 'border-[#16a34a] bg-[#16a34a] text-white hover:enabled:bg-[#15803d]',
  warning: 'border-[#d97706] bg-[#d97706] text-white hover:enabled:bg-[#b45309]',
  danger: 'border-[#dc2626] bg-[#dc2626] text-white hover:enabled:bg-[#b91c1c]',
  info: 'border-[#d9e2ec] bg-[#f8fafc] text-[#475569] hover:enabled:bg-white'
}

export const UiButton = defineComponent({
  name: 'UiButton',
  props: {
    type: { type: String, default: '' },
    plain: Boolean,
    link: Boolean,
    text: Boolean,
    round: Boolean,
    circle: Boolean,
    disabled: Boolean,
    loading: Boolean,
    size: String,
    nativeType: String
  },
  setup(props, { attrs, slots }) {
    const isDisabled = computed(() => props.disabled || props.loading)
    return () => h('button', {
      ...attrs,
      type: props.nativeType || (['button', 'submit', 'reset'].includes(props.type) ? props.type : 'button'),
      disabled: isDisabled.value,
      'aria-busy': props.loading ? 'true' : undefined,
      class: cls(
        buttonBase,
        props.link || props.text
          ? 'min-h-0 border-transparent bg-transparent px-1 py-1 text-[#007aff] shadow-none hover:enabled:text-[#0056b3]'
          : props.plain
            ? 'border-[#d9e2ec] bg-white text-[#334155] hover:enabled:bg-[#f8fafc]'
            : buttonTypes[normalizeType(props.type)],
        props.round && 'rounded-full',
        props.circle && 'h-9 w-9 px-0 rounded-full',
        props.size === 'small' && 'min-h-8 px-2.5 text-[13px]',
        props.size === 'large' && 'min-h-11 px-5 text-[15px]',
        attrs.class
      )
    }, [
      props.loading && h('span', { class: 'h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent', 'aria-hidden': 'true' }),
      slots.default?.()
    ])
  }
})

export const UiIcon = defineComponent({
  name: 'UiIcon',
  props: {
    size: [Number, String],
    color: String
  },
  setup(props, { attrs, slots }) {
    const iconStyle = computed(() => ({
      fontSize: props.size ? (typeof props.size === 'number' ? `${props.size}px` : props.size) : undefined,
      color: props.color
    }))
    return () => h('span', {
      ...attrs,
      style: [iconStyle.value, attrs.style],
      class: cls('ui-icon inline-flex items-center justify-center align-middle leading-none', attrs.class)
    }, slots.default?.())
  }
})

export const UiCard = defineComponent({
  name: 'UiCard',
  props: { shadow: String },
  setup(_, { attrs, slots }) {
    return () => h('section', {
      ...attrs,
      class: cls('ui-card overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-150 hover:border-[#cbd5e1]', attrs.class)
    }, [
      slots.header && h('div', { class: 'ui-card__header border-b border-[#edf2f7] px-5 py-4 text-[15px] font-semibold text-[#0f172a]' }, slots.header()),
      h('div', { class: 'ui-card__body min-w-0 px-5 py-4' }, slots.default?.())
    ])
  }
})

export const UiAlert = defineComponent({
  name: 'UiAlert',
  props: {
    title: String,
    description: String,
    type: { type: String, default: 'info' },
    closable: { type: Boolean, default: true }
  },
  setup(props, { attrs, slots }) {
    const visible = ref(true)
    const tone = computed(() => ({
      success: 'border-[#34c759]/20 bg-[#34c759]/10 text-[#248a3d]',
      warning: 'border-[#ff9500]/20 bg-[#ff9500]/10 text-[#b86a00]',
      danger: 'border-[#ff3b30]/20 bg-[#ff3b30]/10 text-[#b42318]',
      error: 'border-[#ff3b30]/20 bg-[#ff3b30]/10 text-[#b42318]',
      info: 'border-black/[0.06] bg-white/80 text-[#1d1d1f]'
    }[props.type] || 'border-black/[0.06] bg-white/80 text-[#1d1d1f]'))
    return () => visible.value && h('div', {
      ...attrs,
      class: cls('ui-alert flex gap-3 rounded-[14px] border px-5 py-4 text-sm leading-relaxed', tone.value, attrs.class)
    }, [
      h('div', { class: 'min-w-0 flex-1' }, [
        props.title && h('div', { class: 'font-semibold' }, props.title),
        props.description && h('div', { class: 'mt-1 opacity-80' }, props.description),
        slots.default?.()
      ]),
      props.closable && h('button', { class: 'shrink-0 text-lg leading-none opacity-60 hover:opacity-100', onClick: () => { visible.value = false } }, 'x')
    ])
  }
})

export const UiTag = defineComponent({
  name: 'UiTag',
  props: { type: { type: String, default: 'info' }, size: String, effect: String },
  setup(props, { attrs, slots }) {
    const tone = computed(() => {
      const type = normalizeType(props.type)
      if (props.effect === 'dark') {
        return ({
          primary: 'bg-[#007aff] text-white',
          success: 'bg-[#16a34a] text-white',
          warning: 'bg-[#d97706] text-white',
          danger: 'bg-[#dc2626] text-white',
          info: 'bg-[#64748b] text-white'
        }[type] || 'bg-[#64748b] text-white')
      }

      if (props.effect === 'plain') {
        return ({
          primary: 'border border-[#007aff]/30 bg-white text-[#007aff]',
          success: 'border border-[#16a34a]/30 bg-white text-[#16a34a]',
          warning: 'border border-[#d97706]/30 bg-white text-[#d97706]',
          danger: 'border border-[#dc2626]/30 bg-white text-[#dc2626]',
          info: 'border border-[#cbd5e1] bg-white text-[#64748b]'
        }[type] || 'border border-[#cbd5e1] bg-white text-[#64748b]')
      }

      return ({
        primary: 'bg-[#007aff]/10 text-[#007aff]',
        success: 'bg-[#16a34a]/10 text-[#16a34a]',
        warning: 'bg-[#d97706]/10 text-[#d97706]',
        danger: 'bg-[#dc2626]/10 text-[#dc2626]',
        info: 'bg-black/5 text-[#64748b]'
      }[type] || 'bg-black/5 text-[#64748b]')
    })
    return () => h('span', {
      ...attrs,
      class: cls(
        'ui-tag inline-flex h-[26px] items-center rounded-full px-3 text-[12px] font-medium leading-none',
        props.size === 'small' && 'h-[22px] px-2 text-[11px]',
        props.size === 'large' && 'h-8 px-3.5 text-[13px]',
        tone.value,
        attrs.class
      )
    }, slots.default?.())
  }
})

export const UiBadge = defineComponent({
  name: 'UiBadge',
  props: { value: [String, Number], isDot: Boolean, type: String },
  setup(props, { attrs, slots }) {
    return () => h('span', { ...attrs, class: cls('ui-badge relative inline-flex', attrs.class) }, [
      slots.default?.(),
      props.isDot
        ? h('span', { class: 'absolute right-0 top-0 h-2 w-2 rounded-full bg-[#ff3b30] ring-2 ring-white' })
        : props.value !== undefined && h('span', { class: 'absolute -right-2 -top-2 rounded-full bg-[#ff3b30] px-1.5 text-[10px] font-bold text-white' }, String(props.value))
    ])
  }
})

export const UiAvatar = defineComponent({
  name: 'UiAvatar',
  props: { size: { type: [Number, String], default: 40 }, src: String },
  setup(props, { attrs, slots }) {
    const sizeStyle = computed(() => {
      const value = typeof props.size === 'number' ? `${props.size}px` : props.size
      return { width: value, height: value }
    })
    return () => h('span', {
      ...attrs,
      style: [sizeStyle.value, attrs.style],
      class: cls('ui-avatar inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#007aff] to-[#5856d6] text-sm font-semibold text-white', attrs.class)
    }, props.src ? h('img', { src: props.src, class: 'h-full w-full object-cover', alt: '' }) : slots.default?.())
  }
})

export const UiContainer = defineComponent({
  name: 'UiContainer',
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: cls('ui-container flex min-w-0', attrs.class) }, slots.default?.())
  }
})

export const UiAside = defineComponent({
  name: 'UiAside',
  props: { width: String },
  setup(props, { attrs, slots }) {
    return () => h('aside', { ...attrs, style: [{ width: props.width }, attrs.style], class: cls('ui-aside shrink-0', attrs.class) }, slots.default?.())
  }
})

export const UiHeader = defineComponent({
  name: 'UiHeader',
  setup(_, { attrs, slots }) {
    return () => h('header', { ...attrs, class: cls('ui-header', attrs.class) }, slots.default?.())
  }
})

export const UiMain = defineComponent({
  name: 'UiMain',
  setup(_, { attrs, slots }) {
    return () => h('main', { ...attrs, class: cls('ui-main min-w-0 flex-1', attrs.class) }, slots.default?.())
  }
})

export const UiFooter = defineComponent({
  name: 'UiFooter',
  setup(_, { attrs, slots }) {
    return () => h('footer', { ...attrs, class: cls('ui-footer', attrs.class) }, slots.default?.())
  }
})

export const UiScrollbar = defineComponent({
  name: 'UiScrollbar',
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: cls('ui-scrollbar overflow-auto', attrs.class) }, slots.default?.())
  }
})

export const UiMenu = defineComponent({
  name: 'UiMenu',
  props: {
    defaultActive: String,
    collapse: Boolean,
    router: Boolean
  },
  emits: ['select'],
  setup(props, { attrs, emit, slots }) {
    provide('ui-menu', { props, select: (index) => emit('select', index) })
    return () => h('nav', { ...attrs, class: cls('ui-menu space-y-0.5 p-2', attrs.class) }, slots.default?.())
  }
})

export const UiMenuItem = defineComponent({
  name: 'UiMenuItem',
  props: { index: String },
  setup(props, { attrs, slots }) {
    const menu = inject('ui-menu', null)
    return () => {
      const active = menu?.props.defaultActive === props.index
      const content = [
        slots.default?.(),
        !menu?.props.collapse && slots.title?.()
      ]
      const itemProps = {
        ...attrs,
        class: cls('ui-menu-item relative flex h-10 items-center gap-2.5 rounded-lg px-3 text-[13.5px] text-[#6e6e73] transition-colors hover:bg-black/[0.04] hover:text-[#1d1d1f]', active && '!bg-[#007aff]/10 !font-semibold !text-[#007aff]', attrs.class),
        onClick: (event) => {
          attrs.onClick?.(event)
          menu?.select(props.index)
        }
      }
      return menu?.props.router && props.index
        ? h(RouterLink, { ...itemProps, to: props.index }, () => content)
        : h('button', { ...itemProps, type: 'button' }, content)
    }
  }
})

export const UiSubMenu = defineComponent({
  name: 'UiSubMenu',
  props: { index: String },
  setup(_, { attrs, slots }) {
    const open = ref(true)
    return () => h('div', { ...attrs, class: cls('ui-sub-menu', attrs.class) }, [
      h('button', { type: 'button', class: 'flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-[13.5px] text-[#6e6e73] hover:bg-black/[0.04]', onClick: () => { open.value = !open.value } }, slots.title?.()),
      open.value && h('div', { class: 'ml-6 mt-1 space-y-0.5' }, slots.default?.())
    ])
  }
})

export const UiBreadcrumb = defineComponent({
  name: 'UiBreadcrumb',
  props: { separator: { type: String, default: '/' } },
  setup(props, { attrs, slots }) {
    return () => h('nav', { ...attrs, class: cls('ui-breadcrumb flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-[13px] text-[#6e6e73]', attrs.class) },
      flattenVNodes(slots.default?.()).map((node, index, nodes) => [
        node,
        index < nodes.length - 1 && h('span', { class: 'text-[#aeaeb2]' }, props.separator)
      ]))
  }
})

export const UiBreadcrumbItem = defineComponent({
  name: 'UiBreadcrumbItem',
  props: { to: [String, Object] },
  setup(props, { attrs, slots }) {
    return () => props.to
      ? h(RouterLink, { ...attrs, to: props.to, class: cls('hover:text-[#007aff]', attrs.class) }, slots.default)
      : h('span', { ...attrs, class: cls('truncate text-[#1d1d1f] font-medium', attrs.class) }, slots.default?.())
  }
})

export const UiForm = defineComponent({
  name: 'UiForm',
  props: {
    model: Object,
    rules: Object,
    inline: Boolean,
    labelPosition: String,
    labelWidth: String
  },
  setup(props, { attrs, expose, slots }) {
    const errors = reactive({})
    const fieldSet = new Set()
    const initialModel = cloneValue(props.model || {})

    const registeredFields = () => {
      const fields = Array.from(fieldSet)
      return fields.length ? fields : Object.keys(props.rules || {})
    }

    const clearValidate = (fields) => {
      const targets = fields ? (Array.isArray(fields) ? fields : [fields]) : Object.keys(errors)
      targets.forEach((field) => {
        delete errors[field]
      })
    }

    const validateFields = async (fields) => {
      const targets = fields ? (Array.isArray(fields) ? fields : [fields]) : registeredFields()
      const invalidFields = {}
      clearValidate(targets)

      for (const prop of targets) {
        const rules = normalizeRules(props.rules?.[prop])
        if (!rules.length) continue
        const value = getValueByPath(props.model, prop)

        for (const rule of rules) {
          try {
            await validateRule(rule, value, props.model)
          } catch (error) {
            const message = resolveValidationError(error, rule.message || '校验失败')
            errors[prop] = message
            invalidFields[prop] = [{ message, rule }]
            break
          }
        }
      }

      if (Object.keys(invalidFields).length) {
        throw invalidFields
      }
      return true
    }

    const validate = (callback) => {
      const runner = validateFields()
      if (callback) {
        return runner
          .then(() => {
            callback(true)
            return true
          })
          .catch((invalidFields) => {
            callback(false, invalidFields)
            return false
          })
      }
      return runner
    }

    const resetFields = (fields) => {
      const targets = fields ? (Array.isArray(fields) ? fields : [fields]) : registeredFields()
      targets.forEach((field) => {
        setValueByPath(props.model, field, getValueByPath(initialModel, field))
      })
      clearValidate(targets)
    }

    expose({
      validate,
      validateField: (fields, callback) => {
        const runner = validateFields(fields)
        if (callback) {
          return runner
            .then(() => {
              callback(true)
              return true
            })
            .catch((invalidFields) => {
              callback(false, invalidFields)
              return false
            })
        }
        return runner
      },
      resetFields,
      clearValidate
    })
    provide(formKey, {
      errors,
      registerField: (prop) => fieldSet.add(prop),
      unregisterField: (prop) => fieldSet.delete(prop)
    })
    const callSubmitHandlers = (event) => {
      event.preventDefault()
      const handlers = attrs.onSubmit
      if (Array.isArray(handlers)) {
        handlers.forEach((handler) => handler?.(event))
        return
      }
      handlers?.(event)
    }
    return () => h('form', {
      ...attrs,
      class: cls('ui-form', props.inline && 'flex flex-wrap items-end gap-3', attrs.class),
      onSubmit: callSubmitHandlers
    }, slots.default?.())
  }
})

export const UiFormItem = defineComponent({
  name: 'UiFormItem',
  props: { label: String, prop: String, labelWidth: String },
  setup(props, { attrs, slots }) {
    const form = inject(formKey, null)
    onMounted(() => {
      if (props.prop) form?.registerField(props.prop)
    })
    onUnmounted(() => {
      if (props.prop) form?.unregisterField(props.prop)
    })
    const errorMessage = computed(() => props.prop ? form?.errors[props.prop] : '')

    return () => h('label', { ...attrs, class: cls('ui-form-item flex min-w-0 flex-col gap-1.5 text-[13px] text-[#6e6e73]', errorMessage.value && 'text-[#dc2626]', attrs.class) }, [
      props.label && h('span', { class: 'font-medium' }, props.label),
      h('span', { class: 'min-w-0' }, slots.default?.()),
      errorMessage.value && h('span', { class: 'text-[12px] leading-relaxed text-[#dc2626]' }, errorMessage.value)
    ])
  }
})

const inputBase = 'ui-input min-h-10 w-full rounded-lg border border-[#d9e2ec] bg-white px-3 py-2 text-[14px] text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] hover:border-[#b8c7d6] focus:border-[#007aff] focus:ring-3 focus:ring-[#007aff]/10 disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:opacity-70'

export const UiInput = defineComponent({
  name: 'UiInput',
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Boolean, Array],
    type: { type: String, default: 'text' },
    rows: [Number, String],
    placeholder: String,
    disabled: Boolean,
    clearable: Boolean,
    prefixIcon: String,
    suffixIcon: String,
    showPassword: Boolean
  },
  emits: ['update:modelValue', 'input', 'change', 'clear'],
  setup(props, { attrs, emit, expose, slots }) {
    const inputRef = ref(null)
    expose({
      click: () => inputRef.value?.click(),
      focus: () => inputRef.value?.focus(),
      blur: () => inputRef.value?.blur()
    })

    const onInput = (event) => {
      emit('update:modelValue', event.target.value)
      emit('input', event.target.value)
    }
    const clearInput = (event) => {
      event.stopPropagation()
      emit('update:modelValue', '')
      emit('input', '')
      emit('change', '')
      emit('clear')
    }
    const onCheckboxChange = (event) => {
      const optionValue = attrs.value ?? true
      let nextValue
      if (Array.isArray(props.modelValue)) {
        nextValue = event.target.checked
          ? [...new Set([...props.modelValue, optionValue])]
          : props.modelValue.filter((item) => item !== optionValue)
      } else {
        nextValue = event.target.checked
      }
      emit('update:modelValue', nextValue)
      emit('input', nextValue)
      emit('change', nextValue)
    }
    return () => {
      if (props.type === 'checkbox') {
        const optionValue = attrs.value ?? true
        const checked = Array.isArray(props.modelValue)
          ? props.modelValue.includes(optionValue)
          : Boolean(props.modelValue)
        return h('input', {
          ...attrs,
          ref: inputRef,
          type: 'checkbox',
          value: optionValue,
          checked,
          disabled: props.disabled,
          class: cls('ui-input ui-input--checkbox shrink-0 accent-[#007aff]', attrs.class),
          onChange: onCheckboxChange
        })
      }

      if (props.type === 'file') {
        return h('input', {
          ...attrs,
          ref: inputRef,
          type: 'file',
          disabled: props.disabled,
          class: cls(attrs.class),
          onChange: (event) => emit('change', event)
        })
      }

      const hasPrefix = Boolean(slots.prefix || props.prefixIcon)
      const hasSuffix = Boolean(slots.suffix || props.suffixIcon)
      const canClear = props.clearable && !props.disabled && !isEmptyValue(props.modelValue) && props.type !== 'textarea'
      const renderIcon = (name) => h(UiIcon, {}, () => h(resolveComponent(name)))
      const common = {
        ...attrs,
        value: props.modelValue ?? '',
        placeholder: props.placeholder,
        disabled: props.disabled,
        class: cls(inputBase, hasPrefix && 'pl-9', (hasSuffix || canClear) && 'pr-9', attrs.class),
        onInput,
        onChange: (event) => emit('change', event.target.value)
      }
      return h('span', { class: 'ui-input-wrap relative inline-flex w-full items-center' }, [
        hasPrefix && h('span', { class: 'absolute left-3 inline-flex text-[#94a3b8]' }, slots.prefix?.() || renderIcon(props.prefixIcon)),
        props.type === 'textarea'
          ? h('textarea', { ...common, ref: inputRef, rows: props.rows || 3, class: cls(inputBase, 'min-h-[88px] resize-y leading-relaxed', attrs.class) })
          : h('input', { ...common, ref: inputRef, type: props.showPassword ? 'password' : props.type }),
        canClear && h('button', { type: 'button', class: 'absolute right-3 inline-flex h-5 w-5 items-center justify-center rounded-full text-[#94a3b8] hover:bg-[#e2e8f0] hover:text-[#334155]', onClick: clearInput }, 'x'),
        hasSuffix && !canClear && h('span', { class: 'absolute right-3 inline-flex text-[#94a3b8]' }, slots.suffix?.() || renderIcon(props.suffixIcon))
      ])
    }
  }
})

export const UiInputNumber = defineComponent({
  name: 'UiInputNumber',
  props: { modelValue: [Number, String], min: Number, max: Number, step: { type: Number, default: 1 } },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    const update = (event) => {
      const next = event.target.value === '' ? '' : Number(event.target.value)
      emit('update:modelValue', next)
      emit('change', next)
    }
    return () => h('input', {
      ...attrs,
      type: 'number',
      value: props.modelValue ?? '',
      min: props.min,
      max: props.max,
      step: props.step,
      class: cls(inputBase, attrs.class),
      onInput: update
    })
  }
})

export const UiOption = defineComponent({
  name: 'UiOption',
  props: { label: [String, Number], value: [String, Number, Boolean], disabled: Boolean },
  setup() {
    return () => null
  }
})

export const UiSelect = defineComponent({
  name: 'UiSelect',
  props: {
    modelValue: [String, Number, Boolean, Array],
    placeholder: String,
    clearable: Boolean,
    disabled: Boolean
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const buttonRef = ref(null)
    const panelRef = ref(null)
    const open = ref(false)
    const highlightedIndex = ref(-1)
    const panelStyle = ref({})

    const isMultiple = computed(() => attrs.multiple !== undefined && attrs.multiple !== false)
    const optionText = (node) => {
      if (typeof node?.children?.default === 'function') {
        return flattenVNodes(node.children.default()).map(getVNodeText).join('').trim()
      }
      return getVNodeText(node).trim()
    }
    const hasValueProp = (props) => Object.prototype.hasOwnProperty.call(props, 'value')
    const isSameValue = (left, right) => {
      if (left === right) return true
      if (left === null || left === undefined || right === null || right === undefined) return false
      return String(left) === String(right)
    }
    const isEmptySelectValue = (value) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
    const userOptions = computed(() => flattenVNodes(slots.default?.()).filter((node) => node?.type?.name === 'UiOption').map((node, index) => {
      const vnodeProps = toKebabProps(node.props || {})
      const text = optionText(node)
      const label = vnodeProps.label ?? text
      return {
        key: `${index}-${String(hasValueProp(vnodeProps) ? vnodeProps.value : label)}`,
        label,
        value: hasValueProp(vnodeProps) ? vnodeProps.value : (vnodeProps.label ?? text),
        disabled: vnodeProps.disabled === '' || vnodeProps.disabled === true
      }
    }))
    const options = computed(() => {
      if (isMultiple.value || !props.placeholder) return userOptions.value
      return [
        {
          key: '__placeholder',
          label: props.placeholder,
          value: '',
          disabled: !props.clearable,
          placeholder: true
        },
        ...userOptions.value
      ]
    })
    const selectedOptions = computed(() => {
      if (isMultiple.value) {
        const values = Array.isArray(props.modelValue) ? props.modelValue : []
        return userOptions.value.filter((option) => values.some((value) => isSameValue(value, option.value)))
      }
      return userOptions.value.filter((option) => isSameValue(option.value, props.modelValue))
    })
    const emptyOptionLabel = computed(() => {
      const option = userOptions.value.find((item) => isEmptySelectValue(item.value))
      return option?.label
    })
    const selectedLabel = computed(() => {
      if (!isMultiple.value && isEmptySelectValue(props.modelValue)) return props.placeholder || emptyOptionLabel.value || ''
      if (!selectedOptions.value.length) return props.placeholder || ''
      return selectedOptions.value.map((option) => String(option.label ?? '')).join(', ')
    })
    const hasSelection = computed(() => isMultiple.value ? selectedOptions.value.length > 0 : !isEmptySelectValue(props.modelValue))
    const selectedIndex = computed(() => {
      if (isMultiple.value) {
        const values = Array.isArray(props.modelValue) ? props.modelValue : []
        return options.value.findIndex((option) => values.some((value) => isSameValue(value, option.value)))
      }
      return options.value.findIndex((option) => isSameValue(option.value, props.modelValue))
    })
    const firstEnabledIndex = () => options.value.findIndex((option) => !option.disabled)
    const updatePanelPosition = () => {
      const trigger = buttonRef.value
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const gap = 4
      const viewportPadding = 8
      const below = window.innerHeight - rect.bottom - viewportPadding
      const above = rect.top - viewportPadding
      const placeAbove = below < 160 && above > below
      const available = Math.max(120, (placeAbove ? above : below) - gap)
      const maxHeight = Math.min(280, available)
      const left = Math.min(Math.max(viewportPadding, rect.left), Math.max(viewportPadding, window.innerWidth - rect.width - viewportPadding))
      panelStyle.value = {
        left: `${left}px`,
        top: `${placeAbove ? Math.max(viewportPadding, rect.top - gap - maxHeight) : rect.bottom + gap}px`,
        width: `${rect.width}px`,
        maxHeight: `${maxHeight}px`
      }
    }
    const scrollHighlightedIntoView = () => {
      nextTick(() => {
        panelRef.value?.querySelector(`[data-index="${highlightedIndex.value}"]`)?.scrollIntoView({ block: 'nearest' })
      })
    }
    const openPanel = () => {
      if (props.disabled) return
      highlightedIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : firstEnabledIndex()
      open.value = true
      nextTick(() => {
        updatePanelPosition()
        scrollHighlightedIntoView()
      })
    }
    const closePanel = () => {
      open.value = false
    }
    const togglePanel = () => {
      if (open.value) closePanel()
      else openPanel()
    }
    const emitValue = (value) => {
      emit('update:modelValue', value)
      emit('change', value)
    }
    const selectOption = (option) => {
      if (!option || option.disabled) return
      if (isMultiple.value) {
        const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
        const exists = current.some((value) => isSameValue(value, option.value))
        emitValue(exists ? current.filter((value) => !isSameValue(value, option.value)) : [...current, option.value])
        nextTick(scrollHighlightedIntoView)
        return
      }
      emitValue(option.value)
      closePanel()
      nextTick(() => buttonRef.value?.focus())
    }
    const moveHighlight = (step) => {
      const available = options.value
      if (!available.length) return
      let nextIndex = highlightedIndex.value
      for (let offset = 0; offset < available.length; offset += 1) {
        nextIndex = (nextIndex + step + available.length) % available.length
        if (!available[nextIndex]?.disabled) {
          highlightedIndex.value = nextIndex
          scrollHighlightedIntoView()
          return
        }
      }
    }
    const handleTriggerClick = (event) => {
      if (typeof attrs.onClick === 'function') attrs.onClick(event)
      togglePanel()
    }
    const handleKeydown = (event) => {
      if (typeof attrs.onKeydown === 'function') attrs.onKeydown(event)
      if (props.disabled) return
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        event.stopPropagation()
        if (!open.value) openPanel()
        else moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        if (!open.value) openPanel()
        else selectOption(options.value[highlightedIndex.value])
      } else if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closePanel()
      } else if (event.key === 'Tab') {
        closePanel()
      }
    }
    const handleOutsideMouseDown = (event) => {
      if (!open.value) return
      if (buttonRef.value?.contains(event.target) || panelRef.value?.contains(event.target)) return
      closePanel()
    }
    const handleDocumentKeydown = (event) => {
      if (open.value && event.key === 'Escape') closePanel()
    }
    const handleViewportChange = () => {
      if (open.value) updatePanelPosition()
    }

    onMounted(() => {
      document.addEventListener('mousedown', handleOutsideMouseDown)
      document.addEventListener('keydown', handleDocumentKeydown)
      window.addEventListener('resize', handleViewportChange)
      window.addEventListener('scroll', handleViewportChange, true)
    })
    onUnmounted(() => {
      document.removeEventListener('mousedown', handleOutsideMouseDown)
      document.removeEventListener('keydown', handleDocumentKeydown)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    })

    return () => {
      const triggerAttrs = { ...attrs }
      const triggerClass = triggerAttrs.class
      const triggerStyle = triggerAttrs.style
      delete triggerAttrs.class
      delete triggerAttrs.style
      delete triggerAttrs.multiple
      delete triggerAttrs.onClick
      delete triggerAttrs.onKeydown
      const triggerId = triggerAttrs.id
      return [
        h('button', {
          ...triggerAttrs,
          ref: buttonRef,
          type: 'button',
          disabled: props.disabled,
          title: selectedLabel.value,
          role: 'combobox',
          'aria-haspopup': 'listbox',
          'aria-expanded': open.value ? 'true' : 'false',
          'aria-controls': triggerId ? `${triggerId}-listbox` : undefined,
          style: triggerStyle,
          class: cls(
            'ui-select inline-flex !h-10 !min-h-10 max-w-full min-w-[160px] items-center justify-between gap-2 rounded-[10px] border border-[#d9e2ec] !bg-white !px-3.5 !py-0 text-left text-[14px] leading-none text-[#1d1d1f] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-150 focus:outline-none focus-visible:border-[#007aff] focus-visible:ring-4 focus-visible:ring-[#007aff]/15 disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:text-[#94a3b8]',
            triggerClass
          ),
          onClick: handleTriggerClick,
          onKeydown: handleKeydown
        }, [
          h('span', {
            class: cls(
              'min-w-0 flex-1 truncate whitespace-nowrap',
              !hasSelection.value && 'text-[#94a3b8]'
            )
          }, selectedLabel.value || props.placeholder || ''),
          h('span', {
            class: cls(
              'pointer-events-none relative h-4 w-4 shrink-0 text-[#64748b] transition-transform',
              open.value && 'rotate-180'
            ),
            'aria-hidden': 'true'
          }, [
            h('svg', { viewBox: '0 0 20 20', fill: 'currentColor', class: 'h-4 w-4' }, [
              h('path', { 'fill-rule': 'evenodd', d: 'M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z', 'clip-rule': 'evenodd' })
            ])
          ])
        ]),
        h(Teleport, { to: 'body' }, [
          open.value && h('div', {
            ref: panelRef,
            id: triggerId ? `${triggerId}-listbox` : undefined,
            role: 'listbox',
            'aria-multiselectable': isMultiple.value ? 'true' : undefined,
            class: 'ui-select__panel fixed z-[4000] overflow-y-auto rounded-lg border border-[#d9e2ec] bg-white py-1 shadow-[0_14px_32px_rgba(15,23,42,0.16)]',
            style: panelStyle.value,
            onKeydown: handleKeydown
          }, options.value.length
            ? options.value.map((option, index) => {
              const selected = isMultiple.value
                ? selectedOptions.value.some((item) => isSameValue(item.value, option.value))
                : isSameValue(option.value, props.modelValue)
              return h('button', {
                key: option.key,
                type: 'button',
                role: 'option',
                disabled: option.disabled,
                'aria-selected': selected ? 'true' : 'false',
                'data-index': index,
                class: cls(
                  'flex h-9 w-full items-center gap-2 px-3 text-left text-[13px] leading-none transition-colors',
                  option.disabled
                    ? 'cursor-not-allowed text-[#cbd5e1]'
                    : 'cursor-pointer text-[#334155] hover:bg-[#f8fafc] hover:text-[#0f172a]',
                  highlightedIndex.value === index && !option.disabled && 'bg-[#f8fafc] text-[#0f172a]',
                  selected && 'bg-[#e8f2ff] font-medium text-[#0056b3]'
                ),
                onMousedown: (event) => event.preventDefault(),
                onMouseenter: () => {
                  if (!option.disabled) highlightedIndex.value = index
                },
                onClick: () => selectOption(option)
              }, [
                h('span', { class: 'min-w-0 flex-1 truncate whitespace-nowrap' }, String(option.label ?? '')),
                selected && h('span', { class: 'h-1.5 w-1.5 shrink-0 rounded-full bg-[#007aff]', 'aria-hidden': 'true' })
              ])
            })
            : h('div', { class: 'px-3 py-2 text-[13px] text-[#94a3b8]' }, '暂无选项'))
        ])
      ]
    }
  }
})

export const UiDatePicker = defineComponent({
  name: 'UiDatePicker',
  props: {
    modelValue: [String, Number, Date],
    type: { type: String, default: 'date' },
    placeholder: String,
    disabled: Boolean
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    const inputType = computed(() => props.type?.includes('time') ? 'datetime-local' : 'date')
    const inputValue = computed(() => {
      if (!props.modelValue) return ''
      if (props.modelValue instanceof Date) return props.modelValue.toISOString().slice(0, inputType.value === 'date' ? 10 : 16)
      return String(props.modelValue).replace(' ', 'T').slice(0, inputType.value === 'date' ? 10 : 16)
    })
    const update = (event) => {
      const value = event.target.value
      emit('update:modelValue', inputType.value === 'datetime-local' ? value.replace('T', ' ') : value)
      emit('change', value)
    }
    return () => h('input', {
      ...attrs,
      type: inputType.value,
      value: inputValue.value,
      placeholder: props.placeholder,
      disabled: props.disabled,
      class: cls(inputBase, attrs.class),
      onInput: update,
      onChange: update
    })
  }
})

export const UiSwitch = defineComponent({
  name: 'UiSwitch',
  props: {
    modelValue: [Boolean, String, Number],
    disabled: Boolean,
    activeValue: { type: [Boolean, String, Number], default: true },
    inactiveValue: { type: [Boolean, String, Number], default: false }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    const checked = computed(() => props.modelValue === props.activeValue)
    const toggle = (event) => {
      const nextValue = event.target.checked ? props.activeValue : props.inactiveValue
      emit('update:modelValue', nextValue)
      emit('change', nextValue)
    }
    return () => h('label', { ...attrs, class: cls('ui-switch inline-flex cursor-pointer items-center', props.disabled && 'cursor-not-allowed opacity-60', attrs.class) }, [
      h('input', { type: 'checkbox', class: 'peer sr-only', checked: checked.value, disabled: props.disabled, onChange: toggle }),
      h('span', { class: 'h-7 w-12 rounded-full bg-black/10 p-0.5 transition-colors peer-checked:bg-[#34c759]' }, [
        h('span', { class: cls('block h-6 w-6 rounded-full bg-white shadow transition-transform', checked.value && 'translate-x-5') })
      ])
    ])
  }
})

export const UiCheckboxGroup = defineComponent({
  name: 'UiCheckboxGroup',
  props: { modelValue: { type: Array, default: () => [] } },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    provide(checkboxGroupKey, {
      value: computed(() => props.modelValue || []),
      update: (label, checked) => {
        const current = [...(props.modelValue || [])]
        const next = checked ? [...new Set([...current, label])] : current.filter((item) => item !== label)
        emit('update:modelValue', next)
        emit('change', next)
      }
    })
    return () => h('div', { ...attrs, class: cls('ui-checkbox-group flex flex-wrap gap-3', attrs.class) }, slots.default?.())
  }
})

export const UiCheckbox = defineComponent({
  name: 'UiCheckbox',
  props: { modelValue: Boolean, label: [String, Number, Boolean] },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const group = inject(checkboxGroupKey, null)
    const checked = computed(() => group ? group.value.value.includes(props.label) : Boolean(props.modelValue))
    const update = (event) => {
      if (group) group.update(props.label, event.target.checked)
      else {
        emit('update:modelValue', event.target.checked)
        emit('change', event.target.checked)
      }
    }
    return () => h('label', { ...attrs, class: cls('ui-checkbox inline-flex cursor-pointer items-center gap-2 text-[14px] text-[#1d1d1f]', attrs.class) }, [
      h('input', { type: 'checkbox', checked: checked.value, class: 'h-4 w-4 accent-[#007aff]', onChange: update }),
      h('span', slots.default?.() || props.label)
    ])
  }
})

export const UiRadioGroup = defineComponent({
  name: 'UiRadioGroup',
  props: { modelValue: [String, Number, Boolean], size: String },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    provide(radioGroupKey, {
      value: computed(() => props.modelValue),
      update: (value) => {
        emit('update:modelValue', value)
        emit('change', value)
      }
    })
    return () => h('div', { ...attrs, class: cls('ui-radio-group inline-flex flex-wrap gap-2', attrs.class) }, slots.default?.())
  }
})

export const UiRadio = defineComponent({
  name: 'UiRadio',
  props: { label: [String, Number, Boolean] },
  setup(props, { attrs, slots }) {
    const group = inject(radioGroupKey)
    return () => h('label', { ...attrs, class: cls('ui-radio inline-flex cursor-pointer items-center gap-2 text-[14px]', attrs.class) }, [
      h('input', { type: 'radio', checked: group?.value.value === props.label, class: 'h-4 w-4 accent-[#007aff]', onChange: () => group?.update(props.label) }),
      h('span', slots.default?.() || props.label)
    ])
  }
})

export const UiRadioButton = defineComponent({
  name: 'UiRadioButton',
  props: { label: [String, Number, Boolean] },
  setup(props, { attrs, slots }) {
    const group = inject(radioGroupKey)
    const active = computed(() => group?.value.value === props.label)
    return () => h('button', {
      ...attrs,
      type: 'button',
      class: cls('ui-radio-button h-9 rounded-[10px] px-4 text-[13px] font-medium transition-colors', active.value ? 'bg-white text-[#007aff] shadow-sm' : 'bg-black/[0.04] text-[#6e6e73] hover:text-[#1d1d1f]', attrs.class),
      onClick: () => group?.update(props.label)
    }, slots.default?.() || props.label)
  }
})

export const UiSlider = defineComponent({
  name: 'UiSlider',
  props: { modelValue: [Number, Array], min: { type: Number, default: 0 }, max: { type: Number, default: 100 }, step: { type: Number, default: 1 }, range: Boolean },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    const update = (index, raw) => {
      if (props.range) {
        const next = Array.isArray(props.modelValue) ? [...props.modelValue] : [props.min, props.max]
        next[index] = Number(raw)
        emit('update:modelValue', next)
        emit('change', next)
      } else {
        const value = Number(raw)
        emit('update:modelValue', value)
        emit('change', value)
      }
    }
    return () => h('div', { ...attrs, class: cls('ui-slider flex items-center gap-3', attrs.class) },
      props.range
        ? [0, 1].map((index) => h('input', { key: index, type: 'range', min: props.min, max: props.max, step: props.step, value: props.modelValue?.[index] ?? (index ? props.max : props.min), class: 'w-full accent-[#007aff]', onInput: (event) => update(index, event.target.value) }))
        : h('input', { type: 'range', min: props.min, max: props.max, step: props.step, value: props.modelValue ?? props.min, class: 'w-full accent-[#007aff]', onInput: (event) => update(0, event.target.value) }))
  }
})

export const UiRate = defineComponent({
  name: 'UiRate',
  props: { modelValue: { type: Number, default: 0 }, max: { type: Number, default: 5 }, disabled: Boolean, showScore: Boolean },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    return () => h('div', { ...attrs, class: cls('ui-rate inline-flex items-center gap-1 text-[#ff9500]', attrs.class) }, [
      ...Array.from({ length: props.max }, (_, index) => {
        const value = index + 1
        return h('button', { type: 'button', disabled: props.disabled, class: cls('text-lg leading-none', value <= props.modelValue ? 'opacity-100' : 'opacity-30'), onClick: () => { emit('update:modelValue', value); emit('change', value) } }, '★')
      }),
      props.showScore && h('span', { class: 'ml-1 text-[13px] text-[#6e6e73]' }, props.modelValue)
    ])
  }
})

export const UiProgress = defineComponent({
  name: 'UiProgress',
  props: { percentage: { type: Number, default: 0 }, strokeWidth: { type: Number, default: 8 }, status: String, textInside: Boolean, showText: { type: Boolean, default: true }, color: [String, Function] },
  setup(props, { attrs }) {
    const barColor = computed(() => typeof props.color === 'string'
      ? props.color
      : props.status === 'success' ? '#34c759' : props.status === 'warning' ? '#ff9500' : '#007aff')
    return () => h('div', { ...attrs, class: cls('ui-progress flex items-center gap-2', attrs.class) }, [
      h('div', { class: 'min-w-0 flex-1 overflow-hidden rounded-full bg-black/[0.06]', style: { height: `${props.strokeWidth}px` } }, [
        h('div', { class: 'h-full rounded-full transition-[width]', style: { width: `${Math.max(0, Math.min(100, props.percentage))}%`, background: barColor.value } },
          props.textInside ? h('span', { class: 'block px-2 text-right text-[10px] leading-none text-white' }, `${props.percentage}%`) : null)
      ]),
      props.showText && !props.textInside && h('span', { class: 'w-10 text-right text-[12px] text-[#6e6e73]' }, `${props.percentage}%`)
    ])
  }
})

export const UiDivider = defineComponent({
  name: 'UiDivider',
  props: { contentPosition: String },
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: cls('ui-divider my-5 flex items-center gap-3 text-[13px] font-medium text-[#6e6e73]', attrs.class) }, [
      h('span', { class: 'h-px flex-1 bg-black/[0.06]' }),
      slots.default && h('span', {}, slots.default()),
      h('span', { class: 'h-px flex-1 bg-black/[0.06]' })
    ])
  }
})

export const UiRow = defineComponent({
  name: 'UiRow',
  props: { gutter: { type: Number, default: 0 } },
  setup(props, { attrs, slots }) {
    return () => h('div', { ...attrs, style: [{ gap: `${props.gutter}px` }, attrs.style], class: cls('ui-row grid grid-cols-24', attrs.class) }, slots.default?.())
  }
})

export const UiCol = defineComponent({
  name: 'UiCol',
  props: { span: { type: Number, default: 24 } },
  setup(props, { attrs, slots }) {
    return () => h('div', { ...attrs, style: [{ gridColumn: `span ${props.span} / span ${props.span}` }, attrs.style], class: cls('ui-col min-w-0 max-[768px]:col-span-24', attrs.class) }, slots.default?.())
  }
})

export const UiTableColumn = defineComponent({
  name: 'UiTableColumn',
  props: {
    prop: String,
    label: String,
    type: String,
    width: [String, Number],
    minWidth: [String, Number],
    fixed: [String, Boolean],
    align: String,
    sortable: Boolean,
    showOverflowTooltip: Boolean
  },
  setup() {
    return () => null
  }
})

export const UiTable = defineComponent({
  name: 'UiTable',
  props: {
    data: { type: Array, default: () => [] },
    stripe: Boolean,
    border: Boolean,
    loading: Boolean,
    maxHeight: [String, Number],
    rowKey: [String, Function],
    emptyText: { type: String, default: '暂无数据' }
  },
  setup(props, { attrs, slots }) {
    const columns = computed(() => flattenVNodes(slots.default?.()).filter((node) => node?.type?.name === 'UiTableColumn').map((node) => ({
      props: toKebabProps(node.props || {}),
      slots: node.children || {}
    })))
    const valueFor = (row, column, rowIndex) => {
      const columnProps = column.props
      if (columnProps.type === 'index') return rowIndex + 1
      if (!columnProps.prop) return ''
      return columnProps.prop.split('.').reduce((obj, key) => obj?.[key], row)
    }
    return () => h('div', {
      ...attrs,
      class: cls('ui-table-wrap relative w-full overflow-auto rounded-xl border border-[#e2e8f0] bg-white', attrs.class),
      style: [props.maxHeight ? { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight } : null, attrs.style]
    }, [
      props.loading && h('div', { class: 'absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-[#007aff]' }, '加载中...'),
      h('table', { class: 'ui-table min-w-full border-separate border-spacing-0 bg-white text-left text-[13px] text-[#0f172a]' }, [
        h('thead', { class: 'bg-[#f8fafc] text-[12px] font-semibold text-[#64748b]' }, [
          h('tr', columns.value.map((column) => h('th', { class: 'whitespace-nowrap border-b border-[#e2e8f0] px-4 py-3', style: { width: column.props.width ? `${column.props.width}px` : undefined, minWidth: column.props['min-width'] ? `${column.props['min-width']}px` : undefined } }, column.props.label || '')))
        ]),
        h('tbody', props.data.length
          ? props.data.map((row, rowIndex) => h('tr', { key: typeof props.rowKey === 'function' ? props.rowKey(row) : props.rowKey ? row[props.rowKey] : rowIndex, class: cls('transition-colors hover:bg-[#f8fafc]', props.stripe && rowIndex % 2 === 1 && 'bg-[#fbfdff]') },
            columns.value.map((column) => h('td', { class: 'border-b border-[#edf2f7] px-4 py-3 align-middle' },
              column.slots.default
                ? callSlot(column.slots.default, { row, column, $index: rowIndex })
                : valueFor(row, column, rowIndex)
            ))))
          : h('tr', [
              h('td', { class: 'px-4 py-10 text-center text-[#aeaeb2]', colspan: Math.max(columns.value.length, 1) }, props.emptyText)
            ]))
      ])
    ])
  }
})

export const UiDialog = defineComponent({
  name: 'UiDialog',
  props: { modelValue: Boolean, title: String, width: { type: String, default: '520px' }, closeOnClickModal: { type: Boolean, default: true } },
  emits: ['update:modelValue', 'close'],
  setup(props, { emit, slots }) {
    const close = () => { emit('update:modelValue', false); emit('close') }
    return () => h(Teleport, { to: 'body' }, [
      h(Transition, { name: 'ui-fade' }, () => props.modelValue && h('div', { class: 'fixed inset-0 z-[2000] flex items-center justify-center p-4' }, [
        h('div', { class: 'fixed inset-0 bg-[#0f172a]/45', onMousedown: () => props.closeOnClickModal && close() }),
        h('section', { class: 'relative max-h-[calc(100vh-32px)] w-full overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_20px_48px_rgba(15,23,42,0.18)]', style: { maxWidth: props.width } }, [
          h('header', { class: 'flex items-center justify-between border-b border-[#edf2f7] px-5 py-4' }, [
            h('h2', { class: 'text-[16px] font-semibold text-[#0f172a]' }, slots.header?.() || props.title),
            h('button', { type: 'button', class: 'flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]', onClick: close }, '×')
          ]),
          h('div', { class: 'max-h-[calc(100vh-180px)] overflow-y-auto px-5 py-4' }, slots.default?.()),
          slots.footer && h('footer', { class: 'flex justify-end gap-3 border-t border-[#edf2f7] px-5 py-4' }, slots.footer())
        ])
      ]))
    ])
  }
})

export const UiDrawer = defineComponent({
  name: 'UiDrawer',
  inheritAttrs: false,
  props: { modelValue: Boolean, title: String, size: { type: String, default: '400px' }, direction: { type: String, default: 'right' }, withHeader: { type: Boolean, default: true } },
  emits: ['update:modelValue', 'close'],
  setup(props, { attrs, emit, slots }) {
    const close = () => { emit('update:modelValue', false); emit('close') }
    return () => {
      const { class: drawerClass, style: drawerStyle, ...drawerAttrs } = attrs
      return h(Teleport, { to: 'body' }, [
        props.modelValue && h('div', {
          ...drawerAttrs,
          class: cls('ui-drawer fixed inset-0 z-[2000]', drawerClass)
        }, [
        h('div', { class: 'fixed inset-0 bg-[#0f172a]/40', onClick: close }),
        h('aside', {
          class: cls('fixed inset-y-0 flex flex-col border-[#e2e8f0] bg-white shadow-[0_20px_48px_rgba(15,23,42,0.16)]', props.direction === 'ltr' || props.direction === 'left' ? 'left-0 border-r' : 'right-0 border-l'),
          style: [{ width: props.size }, drawerStyle]
        }, [
          props.withHeader && h('header', { class: 'flex h-14 items-center justify-between border-b border-[#edf2f7] px-5' }, [
            h('h2', { class: 'text-[16px] font-semibold text-[#0f172a]' }, slots.header?.() || props.title),
            h('button', { type: 'button', class: 'flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9]', onClick: close }, '×')
          ]),
          h('div', { class: 'flex-1 overflow-y-auto p-5' }, slots.default?.()),
          slots.footer && h('footer', { class: 'flex justify-end gap-3 border-t border-[#edf2f7] px-5 py-4' }, slots.footer())
        ])
        ])
      ])
    }
  }
})

export const UiTooltip = defineComponent({
  name: 'UiTooltip',
  props: { content: String, placement: String },
  setup(props, { attrs, slots }) {
    return () => h('span', { ...attrs, title: props.content, class: cls('ui-tooltip inline-flex', attrs.class) }, slots.default?.())
  }
})

export const UiDropdown = defineComponent({
  name: 'UiDropdown',
  emits: ['command'],
  setup(_, { attrs, emit, slots }) {
    const open = ref(false)
    provide(dropdownKey, { command: (value) => { emit('command', value); open.value = false } })
    return () => h('div', { ...attrs, class: cls('ui-dropdown relative inline-flex', attrs.class) }, [
      h('div', { onClick: () => { open.value = !open.value } }, slots.default?.()),
      open.value && h('div', { class: 'absolute right-0 top-full z-[3000] mt-2 min-w-[160px] rounded-lg border border-[#e2e8f0] bg-white py-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.12)]' }, slots.dropdown?.())
    ])
  }
})

export const UiDropdownMenu = defineComponent({
  name: 'UiDropdownMenu',
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: cls('ui-dropdown-menu', attrs.class) }, slots.default?.())
  }
})

export const UiDropdownItem = defineComponent({
  name: 'UiDropdownItem',
  props: { command: [String, Number], divided: Boolean },
  setup(props, { attrs, slots }) {
    const dropdown = inject(dropdownKey, null)
    return () => h('button', { ...attrs, type: 'button', class: cls('ui-dropdown-item flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-[#334155] hover:bg-[#f8fafc] hover:text-[#0f172a]', props.divided && 'mt-1 border-t border-[#edf2f7] pt-3', attrs.class), onClick: () => dropdown?.command(props.command) }, slots.default?.())
  }
})

export const UiTabs = defineComponent({
  name: 'UiTabs',
  props: { modelValue: [String, Number] },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const panes = computed(() => flattenVNodes(slots.default?.()).filter((node) => node?.type?.name === 'UiTabPane').map((node) => ({ props: toKebabProps(node.props || {}), slots: node.children || {} })))
    const active = computed(() => props.modelValue ?? panes.value[0]?.props.name)
    const setActive = (name) => { emit('update:modelValue', name); emit('change', name) }
    return () => h('div', { ...attrs, class: cls('ui-tabs', attrs.class) }, [
      h('div', { class: 'flex border-b border-[#e2e8f0]' }, panes.value.map((pane) => h('button', { type: 'button', class: cls('h-10 px-4 text-[14px] transition-colors', active.value === pane.props.name ? 'border-b-2 border-[#007aff] font-semibold text-[#007aff]' : 'text-[#64748b] hover:text-[#007aff]'), onClick: () => setActive(pane.props.name) }, pane.props.label))),
      h('div', { class: 'ui-tabs__content pt-4' }, panes.value.find((pane) => pane.props.name === active.value)?.slots.default?.())
    ])
  }
})

export const UiTabPane = defineComponent({
  name: 'UiTabPane',
  props: { label: String, name: [String, Number] },
  setup() {
    return () => null
  }
})

export const UiCollapse = defineComponent({
  name: 'UiCollapse',
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: cls('ui-collapse space-y-2', attrs.class) }, slots.default?.())
  }
})

export const UiCollapseItem = defineComponent({
  name: 'UiCollapseItem',
  props: { title: String },
  setup(props, { attrs, slots }) {
    return () => h('details', { ...attrs, class: cls('ui-collapse-item rounded-xl border border-black/[0.06] bg-white/80 px-4 py-3', attrs.class) }, [
      h('summary', { class: 'cursor-pointer font-medium text-[#1d1d1f]' }, slots.title?.() || props.title),
      h('div', { class: 'mt-3 text-[14px] text-[#1d1d1f]' }, slots.default?.())
    ])
  }
})

export const UiDescriptionsItem = defineComponent({
  name: 'UiDescriptionsItem',
  props: { label: String, span: [String, Number] },
  setup() {
    return () => null
  }
})

export const UiDescriptions = defineComponent({
  name: 'UiDescriptions',
  props: { title: String, column: { type: Number, default: 2 }, border: Boolean },
  setup(props, { attrs, slots }) {
    const items = computed(() => flattenVNodes(slots.default?.()).filter((node) => node?.type?.name === 'UiDescriptionsItem').map((node) => ({ props: toKebabProps(node.props || {}), slots: node.children || {} })))
    return () => h('section', { ...attrs, class: cls('ui-descriptions', attrs.class) }, [
      props.title && h('h3', { class: 'mb-3 text-[16px] font-semibold text-[#1d1d1f]' }, props.title),
      h('div', { class: 'grid overflow-hidden rounded-xl border border-black/[0.06]', style: { gridTemplateColumns: `repeat(${props.column}, minmax(0, 1fr))` } },
        items.value.map((item) => h('div', { class: 'min-w-0 border-b border-r border-black/[0.04] bg-white p-3' }, [
          h('div', { class: 'mb-1 text-[12px] font-medium text-[#6e6e73]' }, item.props.label),
          h('div', { class: 'text-[14px] text-[#1d1d1f]' }, item.slots.default?.())
        ])))
    ])
  }
})

export const UiTimeline = defineComponent({
  name: 'UiTimeline',
  setup(_, { attrs, slots }) {
    return () => h('ol', { ...attrs, class: cls('ui-timeline space-y-4', attrs.class) }, slots.default?.())
  }
})

export const UiTimelineItem = defineComponent({
  name: 'UiTimelineItem',
  props: { timestamp: String, type: String },
  setup(props, { attrs, slots }) {
    return () => h('li', { ...attrs, class: cls('ui-timeline-item relative pl-5 before:absolute before:left-0 before:top-1.5 before:h-2.5 before:w-2.5 before:rounded-full before:bg-[#007aff]', attrs.class) }, [
      props.timestamp && h('div', { class: 'mb-1 text-[12px] text-[#aeaeb2]' }, props.timestamp),
      slots.default?.()
    ])
  }
})

export const UiEmpty = defineComponent({
  name: 'UiEmpty',
  props: { description: { type: String, default: '暂无数据' }, imageSize: [Number, String] },
  setup(props, { attrs, slots }) {
    const sizeStyle = computed(() => props.imageSize ? { minHeight: typeof props.imageSize === 'number' ? `${props.imageSize}px` : props.imageSize } : null)
    return () => h('div', { ...attrs, style: [sizeStyle.value, attrs.style], class: cls('ui-empty flex flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-10 text-center text-[14px] text-[#64748b]', attrs.class) }, slots.default?.() || props.description)
  }
})

export const UiSkeleton = defineComponent({
  name: 'UiSkeleton',
  props: { rows: { type: Number, default: 4 } },
  setup(props, { attrs }) {
    return () => h('div', { ...attrs, class: cls('ui-skeleton space-y-3 p-4', attrs.class) }, Array.from({ length: props.rows }, (_, index) => h('div', { class: 'h-4 animate-g-shimmer rounded bg-[linear-gradient(90deg,#f0f0f0_25%,#e8e8e8_50%,#f0f0f0_75%)] bg-[length:200%_100%]', style: { width: `${80 - index * 10}%` } })))
  }
})

export const UiSpace = defineComponent({
  name: 'UiSpace',
  props: {
    direction: { type: String, default: 'horizontal' },
    size: { type: [String, Number], default: 'default' }
  },
  setup(props, { attrs, slots }) {
    const gapClass = computed(() => {
      if (typeof props.size === 'number') return null
      return ({
        small: 'gap-1.5',
        default: 'gap-2',
        large: 'gap-4'
      }[props.size] || 'gap-2')
    })
    const gapStyle = computed(() => typeof props.size === 'number' ? { gap: `${props.size}px` } : null)
    return () => h('div', {
      ...attrs,
      style: [gapStyle.value, attrs.style],
      class: cls('ui-space inline-flex flex-wrap', props.direction === 'vertical' ? 'flex-col items-stretch' : 'items-center', gapClass.value, attrs.class)
    }, slots.default?.())
  }
})

export const UiLink = defineComponent({
  name: 'UiLink',
  props: { href: String, type: String },
  setup(props, { attrs, slots }) {
    return () => h('a', { ...attrs, href: props.href || attrs.href || '#', class: cls('ui-link text-[#007aff] hover:text-[#0056b3]', attrs.class) }, slots.default?.())
  }
})

export const UiPageHeader = defineComponent({
  name: 'UiPageHeader',
  props: { title: String, content: String, showBack: Boolean },
  emits: ['back'],
  setup(props, { attrs, emit, slots }) {
    if (!props.showBack) {
      return () => h('div', { ...attrs, class: cls('ui-page-header flex items-center gap-3', attrs.class) }, [
        h('div', { class: 'min-w-0' }, [
          h('div', { class: 'text-[18px] font-semibold text-[#0f172a]' }, slots.content?.() || props.content || props.title),
          slots.default?.()
        ])
      ])
    }

    return () => h('div', { ...attrs, class: cls('ui-page-header flex items-center gap-3', attrs.class) }, [
      h('button', {
        type: 'button',
        class: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#007aff] transition-colors hover:bg-[#e8f2ff]',
        'aria-label': 'Back',
        onClick: () => emit('back')
      }, [
        h('svg', {
          class: 'h-4 w-4',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true'
        }, [
          h('path', { d: 'M14 6l-6 6 6 6' })
        ])
      ]),
      h('div', { class: 'min-w-0' }, [
        h('div', { class: 'text-[18px] font-semibold text-[#0f172a]' }, slots.content?.() || props.content || props.title),
        slots.default?.()
      ])
    ])
  }
})

export const UiPagination = defineComponent({
  name: 'UiPagination',
  props: {
    currentPage: Number,
    pageSize: Number,
    total: Number
  },
  emits: ['update:currentPage', 'current-change'],
  setup(props, { attrs, emit }) {
    const totalPages = computed(() => Math.max(1, Math.ceil((props.total || 0) / (props.pageSize || 10))))
    const current = computed(() => props.currentPage || 1)
    const go = (page) => {
      const next = Math.min(totalPages.value, Math.max(1, page))
      emit('update:currentPage', next)
      emit('current-change', next)
    }
    return () => h('div', { ...attrs, class: cls('ui-pagination flex items-center justify-center gap-1.5', attrs.class) }, [
      h(UiButton, { plain: true, disabled: current.value <= 1, onClick: () => go(current.value - 1) }, () => '<'),
      h('span', { class: 'px-3 text-[13px] text-[#6e6e73]' }, `${current.value} / ${totalPages.value}`),
      h(UiButton, { plain: true, disabled: current.value >= totalPages.value, onClick: () => go(current.value + 1) }, () => '>')
    ])
  }
})

export const UiPopconfirm = defineComponent({
  name: 'UiPopconfirm',
  props: { title: String },
  emits: ['confirm', 'cancel'],
  setup(props, { emit, slots }) {
    return () => h('span', { class: 'ui-popconfirm', onClick: (event) => {
      if (event.target.closest('button') && window.confirm(props.title || '确认执行该操作？')) emit('confirm')
      else emit('cancel')
    } }, slots.reference?.() || slots.default?.())
  }
})

export const UiUpload = defineComponent({
  name: 'UiUpload',
  props: {
    onChange: Function,
    onRemove: Function,
    accept: String,
    multiple: Boolean,
    drag: Boolean,
    disabled: Boolean,
    autoUpload: Boolean,
    fileList: Array
  },
  emits: ['change'],
  setup(props, { attrs, emit, expose, slots }) {
    const inputRef = ref(null)
    const normalizeUploadFile = (file) => {
      if (!file) return null
      return {
        uid: file.uid || `${file.name || file.raw?.name || 'file'}-${file.size || file.raw?.size || 0}-${file.lastModified || file.raw?.lastModified || Date.now()}`,
        name: file.name || file.raw?.name || file.file?.name,
        size: file.size || file.raw?.size || file.file?.size,
        raw: file.raw || file.file || file,
        file: file.file || file.raw || file
      }
    }
    const files = ref((props.fileList || []).map(normalizeUploadFile).filter(Boolean))
    const syncFilesFromProps = () => {
      files.value = (props.fileList || []).map(normalizeUploadFile).filter(Boolean)
    }
    const open = () => inputRef.value?.click()
    const clearFiles = () => { files.value = [] }
    expose({ clearFiles, submit: () => {} })

    watch(() => props.fileList, syncFilesFromProps, { deep: true, immediate: true })

    const updateControlledFiles = (nextFiles) => {
      files.value = nextFiles
    }

    const onFileChange = (event) => {
      const selected = Array.from(event.target.files || []).map((file, index) => normalizeUploadFile({
        uid: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        raw: file,
        file
      })).filter(Boolean)
      const nextFiles = props.multiple ? [...files.value, ...selected] : selected
      updateControlledFiles(nextFiles)
      selected.forEach((file) => props.onChange?.(file, files.value))
      emit('change', selected[0], files.value)
      event.target.value = ''
    }
    return () => h('div', { ...attrs, class: cls('ui-upload inline-block', attrs.class) }, [
      h('input', { ref: inputRef, type: 'file', accept: props.accept, multiple: props.multiple, disabled: props.disabled, class: 'sr-only', onChange: onFileChange }),
      h('div', { class: cls(props.drag && 'rounded-2xl border border-dashed border-black/10 bg-white/60 p-6 text-center'), onClick: open }, slots.default?.()),
      slots.tip && h('div', { class: 'mt-2 text-[12px] text-[#aeaeb2]' }, slots.tip())
    ])
  }
})

export const UiSteps = defineComponent({ name: 'UiSteps', setup: (_, { attrs, slots }) => () => h('div', { ...attrs, class: cls('ui-steps flex items-center gap-3', attrs.class) }, slots.default?.()) })
export const UiStep = defineComponent({ name: 'UiStep', props: { title: String }, setup: (props, { attrs, slots }) => () => h('div', { ...attrs, class: cls('ui-step flex items-center gap-2 text-[13px] text-[#6e6e73]', attrs.class) }, [h('span', { class: 'h-2 w-2 rounded-full bg-[#007aff]' }), slots.default?.() || props.title]) })
export const UiCalendar = defineComponent({ name: 'UiCalendar', props: { modelValue: [String, Date] }, emits: ['update:modelValue'], setup: (props, { attrs, emit, slots }) => () => h('div', { ...attrs, class: cls('ui-calendar rounded-2xl bg-white p-4', attrs.class) }, [h('input', { type: 'date', class: inputBase, value: props.modelValue ? String(props.modelValue).slice(0, 10) : '', onInput: (e) => emit('update:modelValue', e.target.value) }), slots.default?.({ date: props.modelValue })]) })

export const uiComponents = {
  UiAlert,
  UiAside,
  UiAvatar,
  UiBadge,
  UiBreadcrumb,
  UiBreadcrumbItem,
  UiButton,
  UiCalendar,
  UiCard,
  UiCheckbox,
  UiCheckboxGroup,
  UiCol,
  UiCollapse,
  UiCollapseItem,
  UiContainer,
  UiDatePicker,
  UiDescriptions,
  UiDescriptionsItem,
  UiDialog,
  UiDivider,
  UiDrawer,
  UiDropdown,
  UiDropdownItem,
  UiDropdownMenu,
  UiEmpty,
  UiFooter,
  UiForm,
  UiFormItem,
  UiHeader,
  UiIcon,
  UiInput,
  UiInputNumber,
  UiLink,
  UiMain,
  UiMenu,
  UiMenuItem,
  UiOption,
  UiPageHeader,
  UiPagination,
  UiPopconfirm,
  UiProgress,
  UiRadio,
  UiRadioButton,
  UiRadioGroup,
  UiRate,
  UiRow,
  UiScrollbar,
  UiSelect,
  UiSkeleton,
  UiSlider,
  UiSpace,
  UiStep,
  UiSteps,
  UiSubMenu,
  UiSwitch,
  UiTabPane,
  UiTable,
  UiTableColumn,
  UiTabs,
  UiTag,
  UiTimeline,
  UiTimelineItem,
  UiTooltip,
  UiUpload
}

export function installUiComponents(app) {
  Object.entries(uiComponents).forEach(([name, component]) => {
    app.component(name, component)
  })
}
