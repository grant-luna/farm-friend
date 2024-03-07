export function findSearchIdFromUrl() {
  return window.location.href.split('/')[window.location.href.split('/').length - 1];
}