import { useEffect, useState } from 'react';
import './App.css';

async function getThesaurusResponse(word, apiKey) {
  const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${apiKey}`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

function isWordNotFound(response) {
  return Array.isArray(response) && response.every(entry => typeof entry === 'string')
}

function getFirstWord(response) {
  console.log('getting', { response })
  if (isWordNotFound(response)) return null
  const word = response[0]
  const def = word.def[0].sseq[0][0][1]
  console.log({ word, def })
  return {
    id: word.meta.id,
    fl: word.fl,
    def: {
      sense: cleanLatex(def.dt?.[0]?.[1]),
      viz: cleanLatex(def.dt?.[1]?.[1]?.[0]?.t),
      syn_list: def.syn_list?.flatMap(syns => syns.map(({ wd }) => wd)) || []
    },
  }
}

function cleanLatex(latex) {
  if (!latex) return null
  return latex.replace(/\{\/?it\}/g, '')
}

function App() {

  const [apiKey, setApiKey] = useState('');
  const [sentence, setSentence] = useState('');
  const [responseData, setResponseData] = useState([]);
  const [firstWord, setFirstWord] = useState(null);
  const [history, setHistory] = useState([]); // Word-Synonym tuples

  function pushToHistory(tuple) {
    return setHistory((history) => [...history, tuple])
  }

  async function catchFormSubmit(event) {
    event.preventDefault();
    const response = await getThesaurusResponse(sentence, apiKey);
    setResponseData(response);
  }

  useEffect(() => {
    const word = getFirstWord(responseData)
    setFirstWord(word)
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
            firstWord && (
              <>
                <p>
                  Result: <br />
                  <b>{firstWord.id} (<i>{firstWord.fl}</i>)</b>{'. '}
                  <i>{firstWord.def.sense.trim()}</i>
                  { firstWord.def.viz && `, as in "${firstWord.def.viz}"`}
                </p>
                <div>
                Synonyms: <br />
                {
                  firstWord.def.syn_list.length ? (
                    <ul>
                      {firstWord.def.syn_list.map((syn, i) => (
                        <li key={`${i}_${syn}`}>{syn} <a href="#" onClick={() => pushToHistory([firstWord.id, syn])}>+ add</a></li>
                      ))}
                    </ul>
                  ) : (
                    <p>None found.</p>
                  )
                }
                <ul>
                  <li>"{firstWord.id}" (unchanged) <a href="#" onClick={() => pushToHistory([firstWord.id, firstWord.id])}>+ add</a></li>
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
  );
}

export default App;
