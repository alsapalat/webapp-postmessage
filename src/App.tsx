/* eslint-disable @typescript-eslint/no-explicit-any */
import { Children, useEffect, useRef, useState } from 'react';
import { TPrintData } from './brridge/types';
import clsx from 'clsx';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';

const TEST_PRINT: TPrintData = [
  { type: 'Text', value: 'Center Text', align: 1, size: 20 },
  { type: 'Text', value: 'Right Text', align: 2, size: 20 },
  { type: 'Text', value: 'Left Text', align: 0, size: 20 },
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

const ALIGN_CLASS: Record<any, string> = {
  default: 'text-left',
  1: 'text-center',
  2: 'text-right',
  3: 'text-left',
}

const MAP_SIZE: Record<any, string> = {
  default: 'text-base',
  15: 'text-sm',
  20: 'text-base',
  25: 'text-lg',
  30: 'text-xl',
  35: 'text-2xl',
}

function divider(char: string) {
  return Array(100).fill(char).join('')
}

function PrintPreview({ data }: { data: TPrintData }) {
  return (
    <div className="font-mono">
      {data.map((item) => {
        if (item.type === 'Text'){
          return <div className={clsx(ALIGN_CLASS[item.align ?? 'default'], MAP_SIZE[item.size ?? 'default'])}>{item.value}</div>
        }
        if (item.type === 'Divider') {
          return <div className="whitespace-nowrap overflow-hidden">
            {divider(item.value)}
          </div>
        }
        if (item.type === 'Barcode') {
          return (
            <div className="flex justify-center">
              <Barcode height={50} value={item.value} displayValue={false} />
            </div>
          )
        }
        if (item.type === 'QR') {
          return (
            <div className="flex justify-center">
              <QRCode
                size={180}
                value={item.value}
              />
            </div>
          )
        }
        return <div>unknown line {item.type}</div>
      })}
    </div>
  )
}

function App() {
  const [isPrinting, setIsPrinting] = useState(false);
  const handlePrint = () => {
    window.brridgePrinterPrint({ data: TEST_PRINT });
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
    }, 6000);
  }
  return (
    <>
      <div className="h-full w-full max-w-lg bg-orange-100 mx-auto flex flex-col relative z-30">
        <div className="px-6 pt-6">
          <div className="font-bold text-center">Test Print</div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 h-full w-full p-6 overflow-auto">
            <div className={clsx("w-full bg-white shadow-lg border border-gray-100 py-8 ease-linear duration-[5s]", isPrinting ? 'transition-all translate-y-[-200%]' : 'transition-none translate-y-0')}>
              <PrintPreview data={TEST_PRINT} />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button className="w-full h-12 bg-orange-500 text-white font-semibold rounded-full disabled:opacity-40" onClick={handlePrint} disabled={isPrinting}>
            {!isPrinting ? 'Print' : 'Printing...'}
          </button>
          <div className="text-center text-xs mt-4">v1.0.10</div>
          <div className="mt-12">
            <button className="w-full border rounded-full py-1 bg-white" type="button" onClick={() => {
              window.brridgePrinterGetInfo();
            }}>Get Printer Status [test]</button>
          </div>
        </div>
      </div>
      <EventLogs />
    </>
  )
}

function EventLogs() {
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
    <div className="absolute top-0 left-0 w-full text-xs text-white z-10">
      <div>Logs:</div>
      <ul>
        {Children.toArray(logs.map((row) => <li>{row}</li>))}
      </ul>
    </div>
  )
}

export function App2() {
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
      <div>v1.0.8</div>
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
