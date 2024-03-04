import { Children, useEffect, useRef, useState } from 'react';
import './App.css'

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const receive = (e: MessageEvent) => {
      setLogs((l) => ([`<<RECEIVED>>|${new Date().toISOString()}|${JSON.stringify({ data: e.data })}`]).concat(l));
    };
    window.addEventListener('message', receive, false);
    return () => {
      window.removeEventListener('message', receive);
    }
  }, []);
  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        const parent: any = window.parent || window;
        parent.postMessage(inputRef.current!.value || 'Hello World', '*')
        setLogs(([`<<SEND>>|${new Date().toISOString()}|${inputRef.current!.value || 'Hello World'}`]).concat(logs))
      }}><input style={{ width: '200px' }} ref={inputRef} placeholder="Enter Body (Hello World)" /><button type="submit">Send Message</button></form>
      <hr />
      <div>Logs:</div>
      <div style={{ textAlign: 'left', height: '400px', overflow: 'auto' }}>
        <ul>
          {Children.toArray(logs.map((row) => <li>{row}</li>))}
        </ul>
      </div>
    </div>
  )
}

export default App
