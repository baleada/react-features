import { isRef, computed } from 'vue'

export default  function ensureTargets (rawTargets) {
  return isRef(rawTargets)
    ? Array.isArray(rawTargets.value)
      ? rawTargets
      : computed(() => [rawTargets.value])
    : Array.isArray(rawTargets)
      ? computed(() => rawTargets)
      : computed(() => [rawTargets])
}