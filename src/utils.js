export function pascalName(name) {
  if (typeof name !== 'string') return null
  return name.split('-').map(e => `${e.charAt(0).toUpperCase()}${e.slice(1)}`).join('')
}
