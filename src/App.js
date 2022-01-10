import { useEffect, useState } from 'react'
import './App.css'
import { getThesaurusResponse, isWordNotFound, getMostCommonUsage } from './utils'

// NB: only the first, and most common, definition is used for each word!
const formatDefinition = (usage) => (
  <p>
    Result: <br />
    <b>{usage.id} (<i>{usage.fl}</i>)</b>{'. '}
    <i>{usage.def.sense.trim()}</i>
    { usage.def.viz && `, as in "${usage.def.viz}"`}
  </p>
)

const STATUS = {
  clean: 0,
  dirty: 1,
  fetching: 2,
}

const App = () => {
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_WEBSTER_API_KEY || '')
  const [sentence, setSentence] = useState('')
  const [fetchingStatus, setFetchingStatus] = useState(STATUS.clean)
  const [responseData, setResponseData] = useState([])
  const [currentUsage, setCurrentUsage] = useState(null)
  const [history, setHistory] = useState([]) // Word-Synonym tuples

  const pushToHistory = (tuple) => {
    return setHistory((history) => [...history, tuple])
  }

  const submitForm = async () => {
    setFetchingStatus(STATUS.fetching)
    const response = await getThesaurusResponse(sentence, apiKey)
    setResponseData(response)
    setFetchingStatus(STATUS.clean)
  }

  const catchFormSubmit = async (event) => {
    event.preventDefault()
    await submitForm()
  }

  const handleSentenceChange = (event) => {
    setSentence(event.target.value)
    setFetchingStatus(STATUS.dirty)
  }

  useEffect(() => {
    const usage = getMostCommonUsage(responseData)
    setCurrentUsage(usage)
  }, [responseData])

  return (
    <div className="App">
      <header className="App-header">
        Thesaurus
      </header>
      <form onSubmit={(event) => event.preventDefault()}>
        <input
          type="text"
          name="api_key"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="API key from dictionaryapi.com"
        />
      </form>
      <form onSubmit={catchFormSubmit}>
        <input
          type="text"
          name="sentence"
          value={sentence}
          onChange={handleSentenceChange}
          placeholder="Word or phrase"
        />
        <button type="submit">Find synonyms</button>
        <button onClick={() => {
          const customText = prompt(`Enter a custom synonym for "${sentence}", or leave blank to use as-is.`)
          pushToHistory([sentence, customText || sentence])
        }}>+ custom</button>
      </form>
      <div className="main">
        <div>
          {fetchingStatus === STATUS.dirty ? (
            <button type="link" onClick={submitForm}>update search</button>
          ) :
            fetchingStatus === STATUS.fetching ? '...' :
            (
              isWordNotFound(responseData) ? (
              <p>{sentence && <>
                <i>"{sentence}" was not found</i>{' '}
                <button type="link" onClick={() => pushToHistory([sentence, sentence])}>+ add anyway</button>
              </>}</p>
            ) : (
              currentUsage && (
                <>
                  {formatDefinition(currentUsage)}
                  <div>
                  Synonyms:
                  {
                    currentUsage.def.syn_list.length ? (
                      <ul>
                        {currentUsage.def.syn_list.map((syn, i) => (
                          <li key={`${i}_${syn}`}>{syn} <button type="link" onClick={() => pushToHistory([currentUsage.id, syn])}>+ add</button></li>
                        ))}
                      </ul>
                    ) : ' None found'
                  }
                  <ul>
                    <li>"{sentence}" (unchanged) <button type="link" onClick={() => pushToHistory([sentence, sentence])}>+ add</button></li>
                  </ul>
                  </div>
                </>
              )
            )
          )}
        </div>
        <div className="output">
          Original:<br />
          {history.map(([word]) => word).join(' ')}<br /><br />
          Thesaurified:<br />
          <b>{history.map(([, syn]) => syn).join(' ')}</b>
        </div>
        <div style={{ marginTop: '1rem '}}>
          <details>
            <summary>
              History{' '}
              <button type="link" onClick={() => setHistory([])}>× clear</button>
              <button type="link" onClick={() => setHistory((hist) => hist.slice(0, hist.length - 1))}>⌫ rm last</button>
            </summary>
            <pre>
              {JSON.stringify(history, null, 2)}
            </pre>
          </details>
          <details>
            <summary>Last API response</summary>
            <pre>
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}

export default App
