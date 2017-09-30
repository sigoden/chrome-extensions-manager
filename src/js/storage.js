/**
 * storage data structure
 *
 * {
 *   tempDisableAll: false,
 *   isolateCategory: 'common',
 *   categories: [
 *     {
 *       name: 'common',
 *       extensions: [
 *         {
 *           id: 'nlipoenfbbikpbjkfpfillcgkoblgpmj',
 *           name: 'Awesome Screenshot: Screen Video Recorder',
 *           description: '',
 *           icon: 'chrome://nlipoenfbbikpbjkfpfillcgkoblgpmj...'
 *         }
 *       ],
 *       editing: false,
 *       enabled: true
 *     }
 *   ]
 * }
 *
 **/

export function load (key) {
  let serialized = localStorage.getItem(key)
  return serialized && JSON.parse(serialized)
}

export function save (key, value) {
  let serialized = JSON.stringify(value)
  localStorage.setItem(key, serialized)
}
