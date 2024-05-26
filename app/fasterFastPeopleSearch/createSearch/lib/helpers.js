export function checkIfRequiredHeaderIsCompleted() {
  
}

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
  const onlyPrimaryAddressMatched = matchedColumnHeaderKeysWithMatchedColumns.length === 1 && matchedColumnHeaderKeysWithMatchedColumns[0] === 'Primary Key'
  const multipleMatchedColumnHeaderKeysMatched = matchedColumnHeaderKeysWithMatchedColumns.length > 1;

  if (onlyPrimaryAddressMatched) {
    const allPrimaryAddressRequiredHeadersMatched = Object.keys(matchedColumnHeaders["Primary Key"]).every((requiredHeader) => matchedColumnHeaders["PrimaryKey"][requiredHeader].length > 0);

    if (allPrimaryAddressRequiredHeadersMatched) return true;
  } else if (multipleMatchedColumnHeaderKeysMatched) {

  }
  
}
