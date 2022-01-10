import { useEffect, useState } from 'react'
import './App.css'
import { getThesaurusResponse, isWordNotFound, getMostCommonUsage } from './utils'

const formatDefinition = (usage) => (
  <p>
    Result: <br />
    <b>{usage.id} (<i>{usage.fl}</i>)</b>{'. '}
    <i>{usage.def.sense.trim()}</i>
    { usage.def.viz && `, as in "${usage.def.viz}"`}
  </p>
)

const App = () => {
  const [apiKey, setApiKey] = useState('')
  const [sentence, setSentence] = useState('')
  const [responseData, setResponseData] = useState([])
  const [currentUsage, setCurrentUsage] = useState(null)
  const [history, setHistory] = useState([]) // Word-Synonym tuples

  const pushToHistory = (tuple) => {
    return setHistory((history) => [...history, tuple])
  }

  const catchFormSubmit = async (event) => {
    event.preventDefault()
    const response = await getThesaurusResponse(sentence, apiKey)
    setResponseData(response)
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
          onChange={(event) => setSentence(event.target.value)}
          placeholder="Word or sentence"
        />
        <input type="submit" />
      </form>
      <div style={{ textAlign: 'left', padding: '0 2rem', fontSize: '150%' }}>
        <div>
          {isWordNotFound(responseData) ? (
            <p>{sentence && (<i>Word not found</i>)}</p>
          ) : (
            currentUsage && (
              <>
                {formatDefinition(currentUsage)}
                <div>
                Synonyms: <br />
                {
                  currentUsage.def.syn_list.length ? (
                    <ul>
                      {currentUsage.def.syn_list.map((syn, i) => (
                        <li key={`${i}_${syn}`}>{syn} <a href="#" onClick={() => pushToHistory([currentUsage.id, syn])}>+ add</a></li>
                      ))}
                    </ul>
                  ) : (
                    <p>None found.</p>
                  )
                }
                <ul>
                  <li>"{currentUsage.id}" (unchanged) <a href="#" onClick={() => pushToHistory([currentUsage.id, currentUsage.id])}>+ add</a></li>
                </ul>
                </div>
              </>
            )
          )}
        </div>
        <p>Your sentence:</p>
        <pre style={{ fontSize: '100%' }}>
          Original:<br />
          {history.map(([word]) => word).join(' ')}<br /><br />
          Thesaurified:<br />
          {history.map(([, syn]) => syn).join(' ')}
        </pre>
        <details>
          <summary>
            History <a href="#" onClick={() => setHistory([])}>clear</a>
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
  )
}

export default App
