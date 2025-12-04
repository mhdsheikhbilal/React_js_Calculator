import React from 'react'

const Display = ({value, error}) => {
  return (
    <div className='w-full bg-gray-200 dark:bg-gray-800 rounded-md p-4 text-right font-mono text-2xl wrap-break-word min-h-12'>
      {error? <span className='text-red-500'>{error}</span>:value|| '0'}
    </div>
  )
}

export default Display
