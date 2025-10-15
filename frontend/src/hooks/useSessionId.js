import { useState, useEffect } from 'react';
import { getOrCreateSessionId } from '@/utils/session';

export const useSessionId = (key = 'sessionId') => {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    setSessionId(getOrCreateSessionId(key));
  }, [key]);

  return sessionId;
};
