import { useState } from 'react'
import Inputbox from './components/Inputbox'
import Head from './components/Head'

const App = () => {
  const [status, setStatus] = useState(200)
  const [statusText, setStatusText] = useState('OK')
  const [resTime, setResTime] = useState(1000)

  return (
    <div>
      <div className='bg-[#08003a] pb-16 flex flex-col items-center'>
        <Head></Head>
        <Inputbox></Inputbox>
      </div>

      <div className='flex flex-col items-center mt-12 gap-3'>
        <div>
          <p className='text-2xl'>
            STATUS:{' '}
            <span
              className={
                'font-semibold' +
                (status >= 200 && status <= 299 ? ' text-green-700' : '') +
                (status >= 300 && status <= 399 ? ' text-yellow-700' : '') +
                (status >= 400 ? ' text-red-700' : '')
              }
            >
              {status} {statusText}
            </span>
          </p>
          <p className='text-2xl'>Response Time (ms): {resTime}</p>
        </div>
      </div>
    </div>
  )
}

export default App
