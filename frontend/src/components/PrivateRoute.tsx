import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageLoader from '@/components/ui/PageLoader';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
