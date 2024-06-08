export function generateHeaderSampleValue(currentHeaderMatchedColumnHeaders, sampleRow) {
  return currentHeaderMatchedColumnHeaders.map((header) => {
    return sampleRow.find((column) => column.header === header).value || '';
  }).join(' ');
}

export function generateSampleRow(parsedCsvFile) {
  const findColumnHeaderSampleValue = (columnHeader, parsedCsvFile) => {
    const matchingRowWithValue = parsedCsvFile.find((row) => {
      return row[columnHeader] !== '';
    });
  
    return matchingRowWithValue ? matchingRowWithValue[columnHeader] : 'Empty';
  };

  const parsedFileHeaders = Object.keys(parsedCsvFile[0]);

  return parsedFileHeaders.map((header) => {
    return { header, value: findColumnHeaderSampleValue(header, parsedCsvFile) };
  });
}

export function processFileForDatabase(parsedCsvFile, categories) {
  return parsedCsvFile.map((parsedCsvFileRow) => {
    return categories.reduce((finalParsedCsvFileRow, category) => {
      const categoryHeaders = Object.keys(category.headers);

      finalParsedCsvFileRow[category.type] = categoryHeaders.reduce((finalHeadersObject, header) => {
        finalHeadersObject[header] = category.headers[header].map((matchedHeader) => parsedCsvFileRow[matchedHeader]).join(' ');
        return finalHeadersObject;
      }, {});

      return finalParsedCsvFileRow;
    }, {});
  }, {});
}

export function updateInProgressStatus(currentCategoryCopy) {
  if (Object.keys(currentCategoryCopy.headers).some((header) => {
    return currentCategoryCopy.headers[header].length > 0
  })) {
    currentCategoryCopy.inProgress = true;
  } else {
    currentCategoryCopy.inProgress = false;
  }
}