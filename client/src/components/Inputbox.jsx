const Inputbox = () => {
  return (
    <div className='flex justify-center mt-16 relative w-fit'>
      <input
        type='text'
        placeholder="Enter your website's URL"
        className='border border-[#444] w-[680px] h-16 pl-4 pr-36 text-xl rounded-md focus:outline-none'
      />
      <button className='bg-[#dc3545] text-white px-6 text-lg absolute right-2 top-[50%] translate-y-[-50%] h-[80%] rounded-md'>
        Submit <i className='fas fa-arrow-right pl-1'></i>
      </button>
    </div>
  )
}

export default Inputbox
