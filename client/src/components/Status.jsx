const Status = ({ type, uptime }) => {
  const bgClasses = {
    '2xx': 'bg-[#228B22]',
    '3xx': 'bg-[#E6AF2E]',
    '4xx': 'bg-[#C82333]',
    '5xx': 'bg-[#C82333]',
  }

  const bg = bgClasses[type]

  return (
    <div
      className={`text-white flex items-end gap-8 py-3 px-4 text-xl ${bg} rounded-md`}
    >
      <span className='font-bold'>{type}</span>
      <div>
        <span className='text-4xl'>{uptime}</span>%
      </div>
    </div>
  )
}

export default Status
