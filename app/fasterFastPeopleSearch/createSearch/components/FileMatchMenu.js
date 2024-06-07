"use client";

function FileMatchMenu() {
  const { parsedCsvFile } = useContext(FileContext);
  const [ isGeneratable, setIsGeneratable ] = useState(false);
  const router = useRouter();

  const [ matchedColumnHeaders, setMatchedColumnHeaders ] = useState({
    "Primary Address": {"Address": [], "City / State": []},
    "Owner Names": {"First Owner": [], "Second Owner": []},
    "Mail Address": {"Address": [], "City / State": []},
  });

  const matchedColumnHeadersKeys = Object.keys(matchedColumnHeaders);

  async function handleGenerateResults() {
    if (isGeneratable) {
      const processedFile = processFileForDatabase(parsedCsvFile, matchedColumnHeaders);
      
      const searchData = await createSearch(JSON.stringify(processedFile));
      const searchId = searchData.id;
      router.push(`/fasterFastPeopleSearch/searches/${searchId}`);
    }
  }

  return (
    <SetIsGeneratableContext.Provider value={setIsGeneratable}>
      <MatchedColumnHeadersContext.Provider value={{ matchedColumnHeaders, setMatchedColumnHeaders }}>
        <div className={`${styles.fileMatchMenuInstructionsContainer}`}>
          <h3>Help Us Generate Your Search Results</h3>
          <p>
          Thank you for uploading your file! Let&#39;s make sure we get the right information 
          to generate your search results. Follow the steps below to choose the correct columns 
          for each category. It&#39;s easy and anyone can do it!
          </p>
          <p>
            For any item you select below, you will be asked to choose the column headers for 
            each category of the item that can be used to re-create the required field.  For example,
            in the Primary Address item, you will be asked to choose the columns which can ultimately
            re-create an Address and a City / State.
          </p>
          <InstructionSteps />
        </div>
        <div>
          <ul className="accordion" id="accordionMenu">
            {matchedColumnHeadersKeys.map((matchedColumnHeaderKey, index) => {
              const requiredHeaders = Object.keys(matchedColumnHeaders[matchedColumnHeaderKey]);
              return (
                <li key={index} className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" 
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#accordion-item-${index}`}
                            aria-expanded="false"
                            aria-controls={`accordion-item-${index}`}
                    >
                      {matchedColumnHeaderKey}
                    </button>
                  </h2>
                  <AccordionBody toggleId={index} requiredHeaders={requiredHeaders} matchedColumnHeaderKey={matchedColumnHeaderKey}/>
                </li>
              );
            })}
          </ul>
        </div>
        <button onClick={handleGenerateResults}
                className={`btn btn-primary ${styles.generateResultsButton}`}
                disabled={!isGeneratable}
                type="button">
                Generate Results
        </button>
      </MatchedColumnHeadersContext.Provider>
    </SetIsGeneratableContext.Provider>
  );
}