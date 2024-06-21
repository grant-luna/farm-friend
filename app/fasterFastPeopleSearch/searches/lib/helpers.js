import deepCopy from '../../../lib/deepCopy.js';

export function sortByNewestSearches(searches) {
  if (searches.length > 1) {
    const copiedSearches = [...searches]

    return copiedSearches.sort((searchOne, searchTwo) => {
      const [ searchOneDate, searchTwoDate ] = [new Date(searchOne["created_at"]), new Date(searchTwo["created_at"])];

      if (searchOneDate > searchTwoDate) {
        return -1;
      } else if (searchOneDate < searchTwoDate) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  return searches;
}

export function sortByOldestSearches(searches) {
  if (searches.length > 1) {
    const copiedSearches = [...searches]
    
    return copiedSearches.sort((searchOne, searchTwo) => {
      const [ searchOneDate, searchTwoDate ] = [new Date(searchOne["created_at"]), new Date(searchTwo["created_at"])];

      if (searchOneDate > searchTwoDate) {
        return 1;
      } else if (searchOneDate < searchTwoDate) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  return searches;
}

export function sortByContactsAscending(searches) {
  if (searches.length > 1) {
    const copiedSearches = [...searches]
    
    return copiedSearches.sort((searchOne, searchTwo) => {      
      if (searchOne.search_data.length > searchTwo.search_data.length) {
        return 1;
      } else if (searchOne.search_data.length < searchTwo.search_data.length) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  return searches;
}

export function sortByContactsDescending(searches) {
  if (searches.length > 1) {
    const copiedSearches = [...searches]
    
    return copiedSearches.sort((searchOne, searchTwo) => {      
      if (searchOne.search_data.length > searchTwo.search_data.length) {
        return -1;
      } else if (searchOne.search_data.length < searchTwo.search_data.length) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  return searches;
}