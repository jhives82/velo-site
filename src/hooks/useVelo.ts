import { useContext } from 'react'
import { Context } from '../contexts/VeloProvider'

const useVelo = () => {
  const { velo } = useContext(Context)
  return velo
}

export default useVelo