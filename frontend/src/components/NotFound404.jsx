import React from 'react'
import { Frown } from 'lucide-react'
import { Link } from 'react-router-dom'

const NotFound404 = () => {
  return (
    <div className='w-screen h-screen flex flex-col justify-center items-center gap-y-4'>
        <Frown size={60} />
        <h1 className='text-2xl font-medium ml-2'>404 | Not Found</h1>
        <p className='text-base-content/70'>The page you are looking for does not exist.</p>
        <Link className='bg-primary text-white px-6 py-2 rounded-md' to="/">Go Back</Link>
    </div>
  )
}

export default NotFound404