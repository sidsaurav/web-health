import { useState } from 'react'

const Inputbox = ({ changeFn }) => {
  const [text, setText] = useState('')

  const handleSubmit = async () => {
    const res = await fetch('http://localhost:8000/api/v1/getstatus', {
      method: 'POST',
      body: JSON.stringify({ url: text }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await res.json()
    changeFn.setStatus(data.status)
    changeFn.setStatusText(data.statusText)
    changeFn.setResTime(data.responseTime)
  }

  return (
    <div className='flex justify-center mt-16 relative w-fit'>
      <input
        type='text'
        placeholder="Enter your website's URL"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className='border border-[#444] w-[680px] h-16 pl-4 pr-36 text-xl rounded-md focus:outline-none'
      />
      <button
        onClick={handleSubmit}
        className='bg-[#dc3545] text-white px-6 text-lg absolute right-2 top-[50%] translate-y-[-50%] h-[80%] rounded-md'
      >
        Submit <i className='fas fa-arrow-right pl-1'></i>
      </button>
    </div>
  )
}

export default Inputbox
