import { Configuration, OpenAIApi } from 'openai';
import { useState } from 'react';

type submitEvent = React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>;

function App() {
  const [prompt, setPrompt] = useState('Bee love sushi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [img, setImg] = useState('');

  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_Open_AI_key,
  });

  const openai = new OpenAIApi(configuration);

  const generateImage = async (e: submitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      });

      if (res.status === 200 && res.data.data[0].url) {
        setImg(res.data.data[0].url);
      }
    } catch (error) {
      setError(true);
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className='App' style={{ backgroundImage: `url(${img})` }}>
      <form style={{ padding: '3rem' }} onSubmit={(e) => generateImage(e)}>
        <textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
        <button onClick={(e) => generateImage(e)}>Generate</button>
      </form>
      {loading && <p>Loading...</p>}

      {error && <p style={{ color: 'red' }}>Error</p>}
    </div>
  );
}

export default App;
