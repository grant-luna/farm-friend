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

export function processFileForDatabase(parsedCsvFile, matchedColumnHeaders) {
  function createFastPeopleSearchLink(pasredCsvFileRow, matchedColumnHeaders) {
    const addressHeaders = matchedColumnHeaders["Address"];
    const cityStateHeaders = matchedColumnHeaders["City / State"];

    const address = addressHeaders.map((addressHeader) => {
      return pasredCsvFileRow[addressHeader]?.replace(/[^0-9a-z ]/gi, '');
    }).join(' ')

    const cityState = cityStateHeaders.map((cityStateHeader) => {
      return pasredCsvFileRow[cityStateHeader];
    }).join(' ');
    
    return `http://www.fastpeoplesearch.com/address/${address}_${cityState}`.replace(/ /g, '-');
  }

  return parsedCsvFile.map(function (parsedCsvFileRow) {
    const primaryAddressLink = createFastPeopleSearchLink(parsedCsvFileRow, matchedColumnHeaders["Primary Address"]);
    const mailAddressLink = createFastPeopleSearchLink(parsedCsvFileRow, matchedColumnHeaders["Mail Address"]);

    return {
      primaryAddressLink,
      mailAddressLink,
      primaryAddress: {
        address: matchedColumnHeaders["Primary Address"]["Address"].map((header) => parsedCsvFileRow[header]).join(' '),
        cityState: matchedColumnHeaders["Primary Address"]["City / State"].map((header) => parsedCsvFileRow[header]).join(' '),
      },
      mailAddress: {
        address: matchedColumnHeaders["Mail Address"]["Address"].map((header) => parsedCsvFileRow[header]).join(' '),
        cityState: matchedColumnHeaders["Mail Address"]["City / State"].map((header) => parsedCsvFileRow[header]).join(' '),
      },
      ownerNames: {
        firstOwner: matchedColumnHeaders["Owner Names"]["First Owner"].map((header) => parsedCsvFileRow[header]).join(' '),
        secondOwner: matchedColumnHeaders["Owner Names"]["Second Owner"].map((header) => parsedCsvFileRow[header]).join(' '),
      }
    }
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

export function updateInProgressStatus(currentCategoryCopy) {
  if (Object.keys(currentCategoryCopy.headers).some((header) => {
    return currentCategoryCopy.headers[header].length > 0
  })) {
    currentCategoryCopy.inProgress = true;
  } else {
    currentCategoryCopy.inProgress = false;
  }
}