import { useContext } from 'react';
import { ConfigContext } from 'context/ConfigContext';

// ==============================|| CONFIG - HOOKS ||============================== //

export default function useConfig() {
  return useContext(ConfigContext);
}