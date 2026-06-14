import { useState } from 'react'

export default function Generate() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')

  async function submit() {
    const resp = await fetch('http://localhost:8000/generate_post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: '', payload: { CoreTokens: input }, target: 'demo' }),
    })
    const data = await resp.json()
    setResult(data.text)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>SignalFlow Generate</h1>
      <textarea rows={8} cols={80} value={input} onChange={(e) => setInput(e.target.value)} />
      <div>
        <button onClick={submit}>Generate</button>
      </div>
      <h2>Result</h2>
      <pre>{result}</pre>
    </main>
  )
}
