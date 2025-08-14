import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h3 className='text-3xl underline bg-red-400'>hello world</h3>
      </div>
    </>
  )
}

export default App
