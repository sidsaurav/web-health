import { useEffect, useState } from 'react'
import Inputbox from './components/Inputbox'
import Head from './components/Head'
import LineChart from './components/LineChart'
import Status from './components/Status'

const App = () => {
  const [status, setStatus] = useState(201)
  const [statusText, setStatusText] = useState('OK')
  const [resTime, setResTime] = useState(1000)

  useEffect(() => {}, [status, statusText, resTime])

  return (
    <div>
      <div className='bg-[#08003a] pb-16 flex flex-col items-center'>
        <Head></Head>
        <Inputbox
          changeFn={{ setStatus, setStatusText, setResTime }}
        ></Inputbox>
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

      <div className='flex justify-center mt-24 h-screen'>
        <LineChart
          label={['a', 'b', 'c', 'd']}
          data={['1', '3', '4', '5']}
        ></LineChart>
        <div className='flex flex-col gap-4 mt-8 ml-24'>
          <div>
            <Status type='2xx' uptime={65.23}></Status>
          </div>
          <div className='flex flex-col gap-4 mt-36'>
            <Status type='3xx' uptime={70.3}></Status>
            <Status type='4xx' uptime={27.47}></Status>
            <Status type='5xx' uptime={0}></Status>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
