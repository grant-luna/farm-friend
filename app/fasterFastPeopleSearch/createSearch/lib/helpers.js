export default function checkIfRequiredHeaderIsCompleted() {
  if (itemName === 'Owner Names') {
    if (Object.keys(requiredHeaders).some((requiredHeader) => requiredHeaders[requiredHeader].length > 0 )) {
      setIsCompleted(true);
    }
  } else if (itemName === 'Primary Address' || itemName === 'Mail Address') {
    if (Object.keys(requiredHeaders).every((requiredHeader) => requiredHeaders[requiredHeader].length > 0)) {
      setIsCompleted(true);

      /*
      if (itemName === 'Primary Address') {
        toggleGeneratableStateProps.setIsGeneratable(true);
      }
      */
    }
  }
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
