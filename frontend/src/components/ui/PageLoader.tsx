import Spinner from './Spinner';

interface PageLoaderProps {
  className?: string;
  fullScreen?: boolean;
}

export default function PageLoader({ className = '', fullScreen = false }: PageLoaderProps) {
  return (
    <div className={`flex justify-center ${fullScreen ? 'items-center min-h-screen' : 'py-16'} ${className}`}>
      <Spinner />
    </div>
  );
}
