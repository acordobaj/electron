import {useContext} from 'react'
import {ThemeContext} from '../../Store/Context'

export default function Button_deploy({title}) {
    const { toggleFormulario } = useContext(ThemeContext);
  
  return (
    <button
        onClick={() => toggleFormulario(title)}
        className="bg-blue-500 text-white font-semibold mx-2 px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
      >
        {title}
      </button>
  )
}
