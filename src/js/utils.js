export function arr2hash (arr, key) {
  return arr.reduce((map, obj) => {
    map[obj[key]] = obj
    return map
  }, {})
}

export function arrDedupConcat (origin, toConcat) {
  return toConcat.reduce((arr, elem) => {
    if (arr.indexOf(elem) < 0) arr.push(elem)
    return arr
  }, origin)
}

export function arrSubtract (origin, toSubtract) {
  return origin.filter(elem => toSubtract.indexOf(elem) !== -1)
}
