import { useState } from 'react';
import './App.css';

async function getThesaurusResponse(word, apiKey) {
  const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${apiKey}`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

function App() {

  const [apiKey, setApiKey] = useState('');
  const [sentence, setSentence] = useState('');
  const [responseData, setResponseData] = useState([]);

  async function catchFormSubmit(event) {
    event.preventDefault();
    const response = await getThesaurusResponse(sentence, apiKey);
    setResponseData(response);
  }

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
        Result (JSON):
        <pre>
          {JSON.stringify(responseData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;
