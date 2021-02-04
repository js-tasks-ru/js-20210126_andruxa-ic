/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const result = [...arr];

  function compare (base, target) {
    return base.localeCompare(target, undefined, {caseFirst: 'upper'});
  }

  switch (param.toLowerCase()) {
  case 'asc':
    return result.sort((a, b) => compare(a, b));
  case 'desc':
    return result.sort((a, b) => compare(b, a));
  }
}
