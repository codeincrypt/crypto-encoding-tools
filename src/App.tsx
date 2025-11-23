import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import './App.css';

interface CardProps {
  title: string;
  desc: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, desc, onClick }) => (
  <div className="card" onClick={onClick}>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState('landing');
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [key, setKey] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const b64EncodeUnicode = (str: string) => window.btoa(unescape(encodeURIComponent(str)));
  const b64DecodeUnicode = (str: string) => {
    try { return decodeURIComponent(escape(window.atob(str))); }
    catch { return 'Invalid Base64 input'; }
  };

  const aesEncrypt = (plain: string, passphrase: string) => {
    return CryptoJS.AES.encrypt(plain, passphrase).toString();
  };
  const aesDecrypt = (cipher: string, passphrase: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, passphrase);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      if (!originalText) return 'Wrong key or invalid ciphertext';
      return originalText;
    } catch { return 'Decryption error'; }
  };

  const hexEncode = (str: string) => CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(str));
  const hexDecode = (hex: string) => {
    try { return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(hex)); }
    catch { return 'Invalid Hex'; }
  };
  const sha256Hash = (str: string) => CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);

  const handleRun = () => {
    if (view === 'base64') {
      setOutput(mode === 'encode' ? b64EncodeUnicode(input) : b64DecodeUnicode(input));
    } else if (view === 'aes') {
      if (!key) return setOutput('Enter key');
      setOutput(mode === 'encrypt' ? aesEncrypt(input, key) : aesDecrypt(input, key));
    } else if (view === 'url') {
      setOutput(mode === 'urlencode' ? encodeURIComponent(input) : decodeURIComponent(input));
    } else if (view === 'others') {
      if (mode === 'hex-encode') setOutput(hexEncode(input));
      else if (mode === 'hex-decode') setOutput(hexDecode(input));
      else if (mode === 'sha256') setOutput(sha256Hash(input));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    alert('Copied');
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  const generatePassphrase = () => {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    setKey(Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join(''));
  };

  return (
    <div className="app-container">
      <header>
          <h1><img className="logo" src="/logo.png" alt="logo" /> Crypto & Encoding Tools</h1>
        <span>Base64 · AES · Hex · SHA256 · URL Encode</span>
      </header>

      {view === 'landing' && (
        <>
          <div className="card-grid">
            <Card title="Base64" desc="Encode & Decode" onClick={() => {
              setView('base64');
              setMode('encode');
            }} />
            <Card title="AES" desc="Encrypt & Decrypt" onClick={() => { setView('aes'); setMode('encrypt'); }} />
            <Card title="Hex / SHA256" desc="Utility Tools" onClick={() => { setView('others'); setMode('hex-encode'); }} />
            <Card title="URL Encoding" desc="URL Encoding & Decoding Tools" onClick={() => { setView('url'); setMode('encrypt'); }} />
            <Card title="Examples" desc="Try sample auto-fill" onClick={() => setView('examples')} />
          </div>
        </>
      )}

      {view !== 'landing' && (
        <div className="section-box">
          <div className='header-section'>
          <h2 className="section-title">
            {view === 'base64' && 'Base64'}
            {view === 'aes' && 'AES'}
            {view === 'others' && 'Utilities'}
            {view === 'url' && 'URL Encoding'}
            {view === 'examples' && 'Examples'}
          </h2>
          <button onClick={() => {setView('landing'); setInput(''); setOutput(''); setKey('');}}>← Back</button>
          </div>

          {view === 'examples' && (
            <>
              <button className='mr-2' onClick={() => { setView('base64'); setInput('Hello Kartik'); setMode('encode'); }}>Base64 Example</button>
              <button className='mr-2' onClick={() => { setView('aes'); setInput('Secret text'); setKey('mypassword'); setMode('encrypt'); }}>AES Example</button>
              <button className='mr-2' onClick={() => { setView('others'); setInput('password'); setMode('sha256'); }}>SHA256 Example</button>
            </>
          )}

          {view !== 'examples' && (
            <div className="tool-container">
              <label>Input</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5} />

              {view === 'base64' && (
                <div className="radio-group">
                  <label><input type="radio" checked={mode === 'encode'} onChange={() => setMode('encode')} /> Encode</label>
                  <label><input type="radio" checked={mode === 'decode'} onChange={() => setMode('decode')} /> Decode</label>
                </div>
              )}

              {view === 'aes' && (
                <>
                  <div className="radio-group">
                    <label><input type="radio" checked={mode === 'encrypt'} onChange={() => setMode('encrypt')} /> Encrypt</label>
                    <label><input type="radio" checked={mode === 'decrypt'} onChange={() => setMode('decrypt')} /> Decrypt</label>
                  </div>

                  <div className='mt-2'>
                  <label>Passphrase</label>
                  <div className="radio-group">
                    <input type={passwordVisible ? 'text' : 'password'} value={key} onChange={(e) => setKey(e.target.value)} />
                    <button onClick={generatePassphrase}>Generate</button>
                    <button onClick={() => setPasswordVisible((v) => !v)}>{passwordVisible ? 'Hide' : 'Show'}</button>
                  </div>
                  </div>
                </>
              )}

              {view === 'others' && (
                <select className="select-group" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="hex-encode">Hex Encode</option>
                  <option value="hex-decode">Hex Decode</option>
                  <option value="sha256">SHA256</option>
                </select>
              )}

              {view === 'url' && (
                <>
                  <div className="radio-group">
                    <label><input type="radio" checked={mode === 'urlencode'} onChange={() => setMode('urlencode')} /> URL Encode</label>
                    <label><input type="radio" checked={mode === 'urldecode'} onChange={() => setMode('urldecode')} /> URL Decode</label>
                  </div>
                </>
              )}

              <div className='mt-2'>
                <button className="primary" onClick={handleRun}>Run</button>
              </div>

              <div className='mt-2'>
                <label>Output</label>
                <textarea readOnly rows={5} value={output} />

                <div className="radio-group">
                  <button onClick={handleCopy}>Copy</button>
                  <button onClick={handleDownload}>Download</button>
                  <button onClick={() => { setInput(''); setOutput(''); setKey(''); }}>Clear</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;