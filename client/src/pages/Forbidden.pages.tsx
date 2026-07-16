import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md rounded-2xl p-6 shadow-lg">
        <CardContent className="text-center">
          <div className="mb-4 flex flex-col items-center">
            <AlertTriangle size={48} className="mb-2 text-red-500" />
            <h1 className="text-2xl font-semibold">403 - Forbidden</h1>
            <p className="mt-2 text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>

          <Button
            onClick={() => navigate('/')}
            className="mt-4 bg-red-500 hover:bg-red-600"
          >
            Go Back Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
