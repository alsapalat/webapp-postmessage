/* eslint-disable @typescript-eslint/no-explicit-any */
import { Children, useEffect, useRef, useState } from 'react';
import './App.css'
import { TPrintData } from './brridge/types';

const TEST_PRINT: TPrintData = [
  { type: 'Text', value: 'Center Text', align: 1, size: 20 },
  { type: 'Text', value: 'Left Text', align: 2, size: 20 },
  { type: 'Text', value: 'Right Text', align: 3, size: 20 },
  { type: 'Divider', value: '+' },
  { type: 'Text', value: 'S Text Size', align: 1, size: 15 },
  { type: 'Text', value: 'N Text Size', align: 1, size: 20 },
  { type: 'Text', value: 'L Text Size', align: 1, size: 25 },
  { type: 'Text', value: 'XL Text Size', align: 1, size: 30 },
  { type: 'Text', value: 'XXL Text Size', align: 1, size: 35 },
  { type: 'Divider', value: '=' },
  { type: 'Barcode', value: '01234567890' },
  { type: 'Divider', value: '-' },
  { type: 'QR', value: '- Hello-World -' },
]

const PrintButton = () => {
  const [log, setLog] = useState<string[]>([]);
  const [canPrint, setCanPrint] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      window.brridgePrinterGetInfo();
    }, 500);
    const receive = (e: MessageEvent) => {
      setLog((s) => s.concat([JSON.stringify(e?.data)]));
      console.log(e);
      setCanPrint(true);
    };
    window.addEventListener('message', receive, false);
    return () => {
      window.removeEventListener('message', receive);
    }
  }, []);
  return (
    <div>
      <div>
        <button disabled={!canPrint} onClick={() => {
          window.brridgePrinterPrint(TEST_PRINT);
        }}>Send Test Print (Array)</button>
      </div>
      <div>
        <button disabled={!canPrint} onClick={() => {
          window.brridgePrinterPrint({ data: TEST_PRINT });
        }}>Send Test Print (Object)</button>
      </div>
      <div>
        {Children.toArray(log.map((x) => <div style={{ fontSize: '10px' }}>{x}</div>))}
      </div>
    </div>
  )
}

function App() {
  const [t, setT] = useState(new Date().getTime());
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
      <div>v1.0.7</div>
      <button type="button" onClick={() => {
        setT(new Date().getTime())
      }}>Refresh</button>
      <div key={t} style={{ border: "1px solid #fff", padding: '20px', marginBottom: '20px' }}>
        <PrintButton />
      </div>
      <div style={{ border: "1px solid #fff", padding: '20px' }}>
        <form onSubmit={(e) => {
          e.preventDefault();
          const parent: any = window.parent ?? window;
          parent.postMessage(inputRef.current!.value || 'Hello World', '*')
          setLogs(([`<<SEND>>|${new Date().toISOString()}|${inputRef.current!.value || 'Hello World'}`]).concat(logs))
        }}><input style={{ width: '200px' }} ref={inputRef} placeholder="Enter Body (Hello World)" /><button type="submit">Send Message</button></form>
        <hr />
        <div>Listener Logs:</div>
        <div style={{ textAlign: 'left', height: '400px', overflow: 'auto' }}>
          <ul>
            {Children.toArray(logs.map((row) => <li>{row}</li>))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
