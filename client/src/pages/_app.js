import { useEffect } from 'react';
import '../../styles/globals.css';
import { useAuthStore } from '../store/authStore';
import { useWorkflowStore } from '../store/workflowStore';
import { getSocket, subscribeToNotifications } from '../services/socket';

export default function App({ Component, pageProps }) {
  const { initAuth, user } = useAuthStore();
  const { fetchNotifications } = useWorkflowStore();

  useEffect(() => {
    initAuth();
    fetchNotifications();
    getSocket();

    const unsubscribe = subscribeToNotifications(user?.id, (notif) => {
      fetchNotifications();
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  return <Component {...pageProps} />;
}
