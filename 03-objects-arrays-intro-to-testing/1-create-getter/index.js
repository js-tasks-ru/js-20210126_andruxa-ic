/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    let propsInPath = path.split('.');

    let nestedProp = obj;
    while (propsInPath.length > 0) {
      if (!nestedProp) {return;}
      
      nestedProp = nestedProp[propsInPath.shift()];
    }
    return nestedProp;
  };
}
