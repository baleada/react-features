import { isRef, onMounted, watchEffect } from 'vue'
import catchWithNextTick from './catchWithNextTick'

export default function useAttributeBinding ({ target, attribute: rawAttribute, value }) {
  const attribute = ensureAttribute(rawAttribute)
  
  if (isRef(value)) {
    onMounted(() => {
      watchEffect(() => catchWithNextTick(() => (target.value.setAttribute(attribute, value.value))))
    })
  } else {
    onMounted(() => catchWithNextTick(() => (target.value.setAttribute(attribute, value))))
  }
}

function ensureAttribute (rawAttribute) {
  switch (rawAttribute) {
    case 'for':
      return 'htmlFor'
    default:
      return rawAttribute
  }
}
