class FileReformatter {
  static findReformatMethod(search) {
    const sortedHeaders = Object.keys(search[0]).sort((a, b) => {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    });

    const dataPropertyIndex = sortedHeaders.findIndex((header) => header === 'data');
    sortedHeaders.splice(dataPropertyIndex, 1);

    const fileFormat = Object.keys(this.validHeaders).find((fileFormat) => {
      return JSON.stringify(FileReformatter.validHeaders[fileFormat]) === JSON.stringify(sortedHeaders);
    });

    return FileReformatter.reformatMethods[fileFormat];
  }

  static prepareForDisplay(search)  {
    const reformatMethod = this.findReformatMethod(search);
    
    return search.map(reformatMethod);
  }
  // https://www.fastpeoplesearch.com/address/346-miraleste-dr-301_san-pedro-ca
  static reformatFidelityTotalFarmCsv(csvRow) {  
    return {
      firstOwner: `${csvRow['Owner1 First Name']} ${csvRow['Owner1 Last Name']}`,
      secondOwner:`${csvRow['Owner2 First Name']} ${csvRow['Owner2 Last Name']}`,
      siteAddress: `${csvRow['Site Address House Number'] || ''} ${csvRow['Site Address Street Name'] || ''}${csvRow['Site Address Unit Number'] ? ` ${csvRow['Site Address Unit Number']} ` : ' '}${csvRow['Site Address City'] || ''}, ${csvRow['Site Address State'] || ''} ${csvRow['Site Address Zip+4']}`,
      siteAddressFpsLink: `https://www.fastpeoplesearch.com/address/${(csvRow['Site Address House Number'] || '').replace(/ /g, '-')}-${(csvRow['Site Address Street Name'] || '').toLowerCase().replace(/ /g, '-')}-${csvRow['Site Address Unit Number'] ? (csvRow['Site Address Unit Number']).replace(/ /g, '-') : ''}_${(csvRow['Site Address City'] || '').toLowerCase().replace(/ /g, '-')}-${(csvRow['Site Address State'] || '').toLowerCase()}`,
      mailAddress: `${csvRow['Full Mail Address'] || ''} ${csvRow['Mail Address City'] || ''}, ${csvRow['Mail Address State'] || ''} ${csvRow['Site Address Zip+4'] || ''}`,
      mailAddressFpsLink: `https://www.fastpeoplesearch.com/address/${(csvRow['Full Mail Address'] || '').toLowerCase().replace(/ /g, '-')}_${(csvRow['Mail Address City'] || '').toLowerCase().replace(/ /g, '-')}-${(csvRow['Mail Address State'] || '').toLowerCase().replace(/ /g, '-')}`,
      bedrooms: csvRow['Bedrooms'],
      bathrooms: csvRow['Bathrooms'],
      buildingSquareFeet: csvRow['Building Area'],
      formerSalePrice: csvRow['Sales Price'],
      formerSaleDate: csvRow['Sale Date'],
      ownerOccupied: csvRow['Owner Occupied'],
      data: csvRow['data'],
    }
  }

  static reformatMethods = {
    "Fidelity Total Farm CSV": this.reformatFidelityTotalFarmCsv,
  }

  static validHeaders = {
    "Fidelity Total Farm CSV": [
      "AVM",
      "Assessed Improve Percent",
      "Assessed Improvement Value",
      "Assessed Land Value",
      "BIRTH",
      "Bathrooms",
      "Bedrooms",
      "Building Area",
      "Cost Per Sq Ft",
      "DEATH",
      "DIVORCE",
      "Email 1",
      "Email 2",
      "Email 3",
      "Email 4",
      "Email 5",
      "Equity",
      "First Loan",
      "Full Mail Address",
      "LTV",
      "Lender Name",
      "Loan Type",
      "LoanAmountDue",
      "Lot Area Acres",
      "Lot Area SQFT",
      "MARRIAGE",
      "Mail Address City",
      "Mail Address State",
      "Mail Address Zip+4",
      "Mailing Carrier",
      "NOD",
      "NOD_ATT",
      "NOD_BEN",
      "NOD_CASE",
      "NOD_CONTACT",
      "NOD_DOCNUM",
      "NOD_DOCTYPE",
      "NOD_LEGAL",
      "NOD_LOANAMO",
      "NOD_LOANDATE",
      "NOD_LOANDOC",
      "NOD_MAILADD",
      "NOD_TRENAME",
      "NOD_TREPHONE",
      "NOD_TRNAME",
      "NOD_TSNUM",
      "NOTES",
      "NTS",
      "NTS_AUCTION",
      "NTS_DOCNUM",
      "NTS_DOCTYPE",
      "NTS_LEGAL",
      "NTS_MINBID",
      "NTS_SALEDATE",
      "NTS_SALETIME",
      "Number Of Stories",
      "Number Of Units",
      "Owner Name",
      "Owner Occupied",
      "Owner1 First Name",
      "Owner1 Last Name",
      "Owner1 Middle Name",
      "Owner1 Spouse First Name",
      "Owner2 First Name",
      "Owner2 Last Name",
      "Owner2 Middle Name",
      "Owner2 Spouse First Name",
      "PHONE",
      "Parcel Number",
      "Phone 1",
      "Phone 2",
      "Phone 3",
      "Phone 4",
      "Phone 5",
      "Pool",
      "Prior Sale Date",
      "Prior Sales Price",
      "Prior Sales Price Code",
      "Rate",
      "Rooms",
      "Sale Date",
      "Sales Document Number",
      "Sales Price",
      "Sales Price Code",
      "Second Loan",
      "Site Address City",
      "Site Address House Number",
      "Site Address State",
      "Site Address Street Name",
      "Site Address Street Prefix",
      "Site Address Unit Number",
      "Site Address Zip+4",
      "Site Carrier Route",
      "Tax Delinquent",
      "Tax Exemption Code",
      "Tax Year",
      "Tract",
      "Type Financing",
      "Use Code Description",
      "Whatsahomeworth",
      "Year Built",
      "Years In Proper",
      "Zoning"
    ]
  }
}

module.exports = FileReformatter;