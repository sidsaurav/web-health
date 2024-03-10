import { useState } from 'react'

const App = () => {
  const [status, setStatus] = useState('200 OK')
  const [resTime, setResTime] = useState('1000')

  return (
    <div>
      <div className='flex flex-col items-center mt-24 gap-3'>
        <h1 className='text-6xl font-semibold'>Web Health Checker</h1>
        <p className='text-xl'>Monitor your website health using our metrics</p>
      </div>

      <div className='flex justify-center mt-36'>
        <input
          type='text'
          placeholder="Enter your website's URL"
          className='border border-[#444] w-[680px] h-16 px-4 text-center text-xl'
        />
      </div>

      <div className='flex flex-col items-center mt-24 gap-3'>
        <div>
          <p className='text-2xl'>STATUS: {status}</p>
          <p className='text-2xl'>Response Time (ms): {resTime}</p>
        </div>
      </div>
    </div>
  )
}

export default App
