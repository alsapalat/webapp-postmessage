/* eslint-disable @typescript-eslint/no-explicit-any */
import { Children, useEffect, useState } from 'react';
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

type TPosEvent = ({
  _event: 'DEBUG'
} | {
  _event: 'LOGOUT'
} | {
  _event: 'PRINT_LOG'
} | {
  _event: 'PRINTER_STATUS',
  printerModel?: string
})

const PrintButton = ({
  onPrint
}: {
  onPrint: (bool: boolean) => void
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState('');
  const handlePrint = () => {
    window.MsysWebPosPrint({ data: TEST_PRINT });
    setIsPrinting(true);
    setTimeout(() => {
      onPrint(true);
      setTimeout(() => {
        setIsPrinting(false);
        onPrint(false)
      }, 6000);
    }, 200)
  }
  useEffect(() => {
    const t = setTimeout(() => {
      setIsTimeout(true)
    }, 5000);

    const receive = (e: MessageEvent) => {
      try {
        const raw = JSON.parse(e.data) as TPosEvent;
        if (raw?._event === 'DEBUG') return; // ignore event logs

        if (raw?._event === 'PRINT_LOG') {
          console.log('print log', raw);
          return;
        }

        if (raw?._event === 'LOGOUT') {
          console.log('logout', raw);
          return;
        }

        if (raw?._event === 'PRINTER_STATUS') {
          if (raw?.printerModel) {
            setIsReady(true);
            clearTimeout(t);
            return;
          }
          setError('Printer Not Detected')
          clearTimeout(t);
        }
      } catch (err) {
        console.log(err);
        setError('Invalid Handshake')
        clearTimeout(t);
      }
    };
    window.addEventListener('message', receive, false);

    setTimeout(()  => {
      window.MsysWebPosGetPrinterInfo();
    }, 100);
    return () => {
      window.removeEventListener('message', receive);
      clearTimeout(t);
    }
  }, [setIsReady]);
  if (error) {
    return (
      <button className="w-full h-12 bg-orange-500 text-white font-semibold rounded-full disabled:opacity-40" disabled>
        {error}
      </button>
    )
  }
  if (isTimeout) {
    return (
      <button className="w-full h-12 bg-orange-500 text-white font-semibold rounded-full disabled:opacity-40" disabled>
        Printer Timeout
      </button>
    )
  }
  if (!isReady) {
    return (
      <button className="w-full h-12 bg-orange-500 text-white font-semibold rounded-full disabled:opacity-40" disabled>
        Connecting...
      </button>
    )
  }
  return (
    <button className="w-full h-12 bg-orange-500 text-white font-semibold rounded-full disabled:opacity-40" onClick={handlePrint} disabled={isPrinting}>
      {!isPrinting ? 'Print' : 'Printing...'}
    </button>
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
      {Children.toArray(data.map((item) => {
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
      }))}
    </div>
  )
}

function App() {
  const [showLogs, setShowLogs] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  return (
    <>
      <div className="h-full w-full max-w-lg bg-orange-100 mx-auto flex flex-col relative z-30">
        <div className="flex justify-between items-center px-6 pt-6">
          <button className="text-sm font-semibold text-orange-500" type="button" onClick={() => {
            setShowLogs(!showLogs);
          }}>Logs</button>
          <div className="px-6">
            <div className="font-bold text-center">Test Print</div>
          </div>
          <button className="text-sm font-semibold text-orange-500" type="button" onClick={() => {
            window.MsysWebPosLogout();
          }}>Logout</button>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 h-full w-full p-6 overflow-auto">
            <div className={clsx("w-full bg-white shadow-lg border border-gray-100 py-8 ease-linear duration-[5s]", isPrinting ? 'transition-all translate-y-[-200%]' : 'transition-none translate-y-0')}>
              <PrintPreview data={TEST_PRINT} />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <PrintButton onPrint={setIsPrinting} />
          <div className="text-center text-xs mt-4">Version 1.1.1</div>
        </div>
      </div>
      <div className={`${showLogs ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
        <EventLogs />
      </div>
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
    <div className="absolute top-16 left-0 w-full text-xs text-white z-50 bg-black/40 overflow-hidden max-h-[200px]">
      <div>Logs:</div>
      <ul>
        {Children.toArray(logs.map((row) => <li>{row}</li>))}
      </ul>
    </div>
  )
}

export default App
