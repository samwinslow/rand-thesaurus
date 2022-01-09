import './App.css';

function catchFormSubmit(event) {

}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Thesaurus
      </header>
      <form onSubmit={catchFormSubmit}>
        <input type="text" name="sentence" placeholder="Your sentence" />
        <input type="submit" />
      </form>
    </div>
  );
}

export default App;
