import { useContext } from 'react'
import { Context } from '../contexts/VeloProvider'

// const useVelo = () => {
//   return { ...useContext(Context) }
// }

// const useVelo = () => {
//   const { velo } = useContext(Context)
//   return velo
// }

const useVelo = () => {
  return useContext(Context)
}

export default useVelo