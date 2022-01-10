const cleanLatex = (latex) => {
  if (!latex) return null
  return latex.replace(/\{\/?it\}/g, '')
}

export const getThesaurusResponse = async (word, apiKey) => {
  const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${apiKey}`
  const response = await fetch(url)
  return await response.json()
}

export const isWordNotFound = (response) => (
  !response || (Array.isArray(response) && response.every(entry => typeof entry === 'string'))
)

export const getMostCommonUsage = (response) => {
  if (isWordNotFound(response)) return null
  const word = response[0]
  const def = word.def[0].sseq[0][0][1]
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
