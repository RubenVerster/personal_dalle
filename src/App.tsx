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
import AiArt from './assets/img/ai_art.png';

import { PixelOptions, submitEvent } from './types';

import { TfiLayoutGrid2, TfiLayoutGrid3, TfiLayoutGrid4 } from 'react-icons/tfi';
import { RiLogoutBoxLine } from 'react-icons/ri';

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
    setImg('');
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

  const handleQualityChange = () => {
    if (imgQuality === PixelOptions.small) {
      setImgQuality(PixelOptions.medium);
    } else if (imgQuality === PixelOptions.medium) {
      setImgQuality(PixelOptions.large);
    } else if (imgQuality === PixelOptions.large) {
      setImgQuality(PixelOptions.small);
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

  const renderStars = () => {
    const starsList = [];
    for (let i = 0; i < 3; i++) {
      starsList.push(
        <span className='magic-star'>
          <svg viewBox='0 0 512 512'>
            <path d='M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z' />
          </svg>
        </span>
      );
    }
    return starsList;
  };

  let index = 0,
    interval = 2500;

  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const animate = (star) => {
    star.style.setProperty('--star-left', `${rand(-100, 150)}%`);
    star.style.setProperty('--star-top', `${rand(-70, 90)}%`);

    star.style.animation = 'none';
    star.offsetHeight;
    star.style.animation = '';
  };

  const stars = document.querySelectorAll('.magic-star');

  for (const star of stars) {
    setTimeout(() => {
      animate(star);

      setInterval(() => animate(star), 1000);
    }, index++ * (interval / 3));
  }

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
      <div className='container_generated'>
        {!imgLoading && (
          <img
            className='container_generated__img'
            onClick={() => copyImageToClipboard()}
            src={img}
            alt={prompt}
          />
        )}

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
                  {error && <p className='text_error'>Stop abusing this app!</p>}

                  <div className='container_controls__quality'>
                    <button
                      className='button_custom button_controls quality'
                      onClick={() => handleQualityChange()}
                    >
                      {imgQuality === PixelOptions.small && <TfiLayoutGrid2 size={33} />}
                      {imgQuality === PixelOptions.medium && <TfiLayoutGrid3 size={33} />}
                      {imgQuality === PixelOptions.large && <TfiLayoutGrid4 size={33} />}
                    </button>
                    <button
                      className='button_custom button_controls'
                      disabled={imgLoading}
                      onClick={(e) => generateImage(e)}
                    >
                      <span className='magic'>
                        {renderStars()}
                        <span className='magic-text'>Generate</span>
                      </span>
                    </button>
                  </div>
                </div>
                <button
                  className='button_custom button_logout'
                  disabled={authLoading}
                  onClick={(e) => logOut(e)}
                >
                  <RiLogoutBoxLine size={33} />
                </button>
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
