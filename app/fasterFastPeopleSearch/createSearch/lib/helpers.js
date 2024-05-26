export function generateRequiredHeaderSampleValue(matchedColumnHeaders, sampleRow) {
  return matchedColumnHeaders.map((columnHeader) => {
    return sampleRow.find((row) => row.header === columnHeader).value;
  }).join(' ');
}

export function generateSampleRow(parsedFile) {
  const findColumnHeaderSampleValue = (columnHeader, parsedFile) => {
    const matchingRowWithValue = parsedFile.find((row) => {
      return row[columnHeader] !== '';
    });
  
    return matchingRowWithValue ? matchingRowWithValue[columnHeader] : 'Empty';
  };

  const parsedFileHeaders = Object.keys(parsedFile[0]);

  return parsedFileHeaders.map((header) => {
    return { header, value: findColumnHeaderSampleValue(header, parsedFile) };
  });
}

export function resultsAreGenerateable(matchedColumnHeaderContext) {
  const matchedColumnHeaders = matchedColumnHeaderContext.matchedColumnHeaders;
  const matchedColumnHeaderKeysWithMatchedColumns = Object.keys(matchedColumnHeaders).filter((matchedColumnHeaderKey) => {
    return Object.keys(matchedColumnHeaders[matchedColumnHeaderKey]).some((requiredHeader) => matchedColumnHeaders[matchedColumnHeaderKey][requiredHeader].length > 0)
  });
  const onlyPrimaryAddressMatched = matchedColumnHeaderKeysWithMatchedColumns.length === 1 && matchedColumnHeaderKeysWithMatchedColumns[0] === 'Primary Address'
  const multipleMatchedColumnHeaderKeysMatched = matchedColumnHeaderKeysWithMatchedColumns.length > 1;
  
  if (onlyPrimaryAddressMatched) {
    const allPrimaryAddressRequiredHeadersMatched = Object.keys(matchedColumnHeaders["Primary Address"]).every((requiredHeader) => matchedColumnHeaders["Primary Address"][requiredHeader].length > 0);
    
    return allPrimaryAddressRequiredHeadersMatched ? true : false;
  } else if (multipleMatchedColumnHeaderKeysMatched) {
    let generatableStatus = true;

    matchedColumnHeaderKeysWithMatchedColumns.forEach((matchedColumnHeaderKey) => {
      if (matchedColumnHeaderKey === 'Owner Names') {
        const atLeastOneOwnerNameMatched = Object.keys(matchedColumnHeaders["Owner Names"]).some((requiredHeader) => {
          return matchedColumnHeaders[matchedColumnHeaderKey][requiredHeader].length > 0;
        });

        if (!atLeastOneOwnerNameMatched) generatableStatus = false;
      } else if (matchedColumnHeaderKey === 'Primary Address' || matchedColumnHeaderKey === 'Mail Address') {
        const everyRequiredHeaderMatched = Object.keys(matchedColumnHeaders[matchedColumnHeaderKey]).every((requiredHeader) => {
          return matchedColumnHeaders[matchedColumnHeaderKey][requiredHeader].length > 0;
        });

        if (!everyRequiredHeaderMatched) generatableStatus = false;
      }
    });

    return generatableStatus;
  }
}
