import { useState } from 'react';
import RealLoginModal from '@/components/RealLoginModal';
import { Button } from '@/components/ui/button';

export default function TestLogin() {
  const [showModal, setShowModal] = useState(false);

  const handleLogin = (credentials: { email: string; password: string }) => {
    console.log('Login successful:', credentials);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Test Login Page</h1>
        <p className="text-muted-foreground">Test login tracking for admin panel</p>
        
        <Button onClick={() => setShowModal(true)}>
          Open Login Modal
        </Button>
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <ol className="text-sm text-left space-y-1">
            <li>1. Open Admin Panel in another tab (admin@optimsp.com / admin123)</li>
            <li>2. Click "Open Login Modal" above</li>
            <li>3. Try logging in or creating account</li>
            <li>4. Check Admin Panel for real-time updates</li>
          </ol>
        </div>
      </div>

      <RealLoginModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}