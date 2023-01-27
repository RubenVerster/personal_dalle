import { Configuration, OpenAIApi } from 'openai';
import { useEffect, useState } from 'react';
import {
  setPersistence,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
} from 'firebase/auth';
import './firebase';
type submitEvent = React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>;

function App() {
  const firebaseAuth = getAuth();

  const checkIfUserLoggedIn = () => {
    setAuthLoading(true);
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setAuth(true);
      } else {
        setAuth(false);
      }

      setAuthLoading(false);
    });
  };
  useEffect(() => {
    checkIfUserLoggedIn();
  }, []);

  const [prompt, setPrompt] = useState('Bee love sushi');
  const [authLoading, setAuthLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [error, setError] = useState(false);
  const [img, setImg] = useState('');

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [auth, setAuth] = useState(false);

  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_Open_AI_key,
  });

  const openai = new OpenAIApi(configuration);

  const generateImage = async (e: submitEvent) => {
    e.preventDefault();
    setImgLoading(true);
    setError(false);
    try {
      const res = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: '256x256',
      });

      if (res.status === 200 && res.data.data[0].url) {
        setImg(res.data.data[0].url);
      }
    } catch (error) {
      setError(true);
      console.error(error);
    }
    setImgLoading(false);
  };

  const login = async (e: submitEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(false);
    try {
      const res = await signInWithEmailAndPassword(firebaseAuth, userEmail, userPassword);
      if (res) {
        console.log(res);
        await setPersistence(firebaseAuth, browserLocalPersistence);
        await setAuth(true);
      }
    } catch (error) {
      setError(true);
      console.error(error);
    }
    setAuthLoading(false);
  };

  const logOut = async (e: submitEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(false);
    try {
      await firebaseAuth.signOut();
      await setAuth(false);
    } catch (error) {
      setError(true);
      console.error(error);
    }
    setAuthLoading(false);
  };

  return (
    <div className='App'>
      <div className='image-container' style={{ backgroundImage: `url(${img})` }}></div>
      {authLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {auth ? (
            <div>
              {imgLoading && <p>Loading...</p>}
              <form className='form-container' onSubmit={(e) => generateImage(e)}>
                <textarea rows={7} value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
                <button onClick={(e) => generateImage(e)}>Generate</button>
              </form>
              <button onClick={(e) => logOut(e)}>Log Out</button>
            </div>
          ) : (
            <form className='form-cotainer'>
              <input type='email' placeholder='Email' onChange={(e) => setUserEmail(e.target.value)} />
              <input
                type='password'
                placeholder='Password'
                onChange={(e) => setUserPassword(e.target.value)}
              />
              <button onClick={(e) => login(e)}>Login</button>
            </form>
          )}

          {error && <p style={{ color: 'red' }}>Error</p>}
        </div>
      )}
    </div>
  );
}

export default App;
