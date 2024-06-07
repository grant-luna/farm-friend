export default function deepCopy(object) {
  if (object === null || typeof object !== 'object') {
    return object;
  }

  if (Array.isArray(object)) {
    const copy = [];
    for (let index = 0; index < object.length; index += 1) {
      copy[index] = deepCopy(object[index]);
    }
    return copy;
  }

  const copy = {};
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      copy[key] = deepCopy(object[key]);
    }
  }

  return copy;
}