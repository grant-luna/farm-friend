function generateCurrentMatch(requiredHeaders, requiredHeader, sampleRow) {
  return requiredHeaders[requiredHeader].map((columnHeader) => {
    return sampleRow.find((row) => row.header === columnHeader).value;
  }).join(' ');
}