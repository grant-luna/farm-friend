function checkIfAllRequiredCategoriesAreCompleted(categories) {
  const requiredCategories = categories.filter((category) => category.required);

  return requiredCategories.every((requiredCategory) => requiredCategory.completed())
}

export function checkIfHeaderIsCurrentHeader(currentHeaderIndex, currentCategory, header) {
  return currentHeaderIndex === Object.keys(currentCategory.headers).indexOf(header)
}

function createFastPeopleSearchSearchLink(parsedCsvFileRow, category) {
  const address = category.headers["Street Address"].map((header) => {
    return parsedCsvFileRow[header];
  }).join(' ')
    .replace(/[^a-z0-9 ]/gi, '') // Remove non-alphanumeric characters except spaces
    .replace(/\s+/g, ' ')        // Reduce multiple spaces to a single space
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-');

  const city = category.headers["City"].map((header) => {
    return parsedCsvFileRow[header];
  }).join('-')
    .replace(/[^a-z0-9 ]/gi, '') // Remove non-alphanumeric characters except spaces
    .replace(/\s+/g, ' ')        // Reduce multiple spaces to a single space
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-');
  
  const state = category.headers["State"].map((header) => {
    return parsedCsvFileRow[header];
  }).join(' ')
    .replace(/[^a-z]/gi, '') // Remove non-alphanumeric characters except spaces
    .replace(/\s+/g, ' ')        // Reduce multiple spaces to a single space
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-');

  return `https://www.fastpeoplesearch.com/address/${address}_${city}-${state}`;
}

export function columnIsSelected(column, currentHeaderMatchedColumnHeaders) {
  return currentHeaderMatchedColumnHeaders.includes(column);
}

export function generateHeaderSampleValue(currentHeaderMatchedColumnHeaders, sampleRow) {
  return currentHeaderMatchedColumnHeaders.map((header) => {
    return sampleRow.find((column) => column.header === header).value || '';
  }).join(' ');
}

export function generateTooltipMessage(categories) {
  const inProgressCategories = categories.filter((category) => category.inProgress());

  if (inProgressCategories.length === 0) {
    return 'Select a required category above to get started.';
  } else {
    const inProgressIncompleteCategories = categories.filter((category) => category.inProgress() && !category.completed());
    const incompleteHeaders = inProgressIncompleteCategories.map((category) => {
      const incompleteHeaders = Object.keys(category.headers).filter((header) => {
        return category.headers[header].length === 0;
      });
      return `${category.type}: [${incompleteHeaders.join(', ')}]`
    });

    let finalText = 'Incomplete Items:';
    incompleteHeaders.forEach((incompleteHeader) => {
      finalText += '\n'
      finalText += incompleteHeader
    });

    return finalText;
  }
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

      if (Object.keys(category.headers).includes("City")) {
        finalParsedCsvFileRow[category.type]["FastPeopleSearch Url"] = createFastPeopleSearchSearchLink(parsedCsvFileRow, category);
      }

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