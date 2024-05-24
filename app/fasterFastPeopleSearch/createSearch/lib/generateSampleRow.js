export default function generateSampleRow(parsedFile) {
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
