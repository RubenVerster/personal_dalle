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
import { DotLoader, ScaleLoader } from 'react-spinners';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Bee from './assets/img/bee.png';
import AiArt from './assets/img/ai_art.jpeg';

import { PixelOptions, submitEvent } from './types';

function App() {
  const firebaseAuth = getAuth();

  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_Open_AI_key,
  });
  const openai = new OpenAIApi(configuration);

  const [prompt, setPrompt] = useState('Bee love sushi');
  const [authLoading, setAuthLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [error, setError] = useState(false);

  const [img, setImg] = useState(Bee);
  const [imgQuality, setImgQuality] = useState(PixelOptions.small);

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [auth, setAuth] = useState(false);

  const generateImage = async (e: submitEvent) => {
    e.preventDefault();
    setImg(Bee);
    setImgLoading(true);
    setError(false);
    try {
      const res = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: imgQuality,
      });

      if (res.status === 200 && res.data.data[0].url) {
        setImg(res.data.data[0].url);
      }
    } catch (error) {
      setError(true);
      console.error(error);
    }
    setTimeout(() => {
      setImgLoading(false);
    }, 2222);
  };

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
  const copyImageToClipboard = async () => {
    toast.info('Copying image to clipboard...', {});
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': await fetch(img).then((r) => r.blob()),
        }),
      ]);
      toast.success('Image copied!', {});
    } catch (error) {
      toast.error('Failed to copy!', {});
      console.error(error);
    }
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
      <ToastContainer
        position='top-left'
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme='dark'
      />
      <div className='container_genrated'>
        <img
          className='container_genrated__img'
          onClick={() => copyImageToClipboard()}
          src={img}
          alt='Generated'
        />

        {imgLoading && (
          <div className='loading-overlay'>
            <DotLoader size={169} color='#1e50d8' />
          </div>
        )}
      </div>
      <div className='container_controls' style={{ backgroundImage: `url(${AiArt})` }}>
        {authLoading ? (
          <ScaleLoader color='#1e50d8' height={169} margin={7} radius={10} width={42} />
        ) : (
          <>
            {auth ? (
              <div className='user_controls'>
                <div className='form-container'>
                  <input value={prompt} onChange={(e) => setPrompt(e.target.value)}></input>
                  <div className='container_controls__quality'>
                    <button
                      className={`button_custom ${imgQuality === PixelOptions.small && 'active'}`}
                      disabled={imgLoading}
                      onClick={() => setImgQuality(PixelOptions.small)}
                    >
                      Small
                    </button>
                    <button
                      className={`button_custom button_medium ${
                        imgQuality === PixelOptions.medium && 'active'
                      }`}
                      disabled={imgLoading}
                      onClick={() => setImgQuality(PixelOptions.medium)}
                    >
                      Medium
                    </button>
                    <button
                      className={`button_custom ${imgQuality === PixelOptions.large && 'active'}`}
                      disabled={imgLoading}
                      onClick={() => setImgQuality(PixelOptions.large)}
                    >
                      Large
                    </button>
                  </div>
                  <button className='button_custom' disabled={imgLoading} onClick={(e) => generateImage(e)}>
                    Generate
                  </button>
                </div>
                <button
                  className='button_custom button_logout'
                  disabled={authLoading}
                  onClick={(e) => logOut(e)}
                >
                  Log Out
                </button>
                {error && <p className='text_error'>Stop abusing this app</p>}
              </div>
            ) : (
              <form className='form-container'>
                <input type='email' placeholder='Email' onChange={(e) => setUserEmail(e.target.value)} />
                <input
                  type='password'
                  placeholder='Password'
                  onChange={(e) => setUserPassword(e.target.value)}
                />
                <button className='button_custom' disabled={authLoading} onClick={(e) => login(e)}>
                  Login
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
