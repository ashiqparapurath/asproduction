'use client';

import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

export function HostUrl() {
  const [hostname, setHostname] = useState('');

  useEffect(() => {
    // This code runs only on the client, where window is available
    setHostname(window.location.host);
  }, []);

  if (!hostname) {
    return null;
  }

  return (
    <div className="container mx-auto flex items-center justify-center gap-2 text-muted-foreground">
        <Globe className="h-4 w-4" />
        <p>
            Your site is live at: <a href={`https://${hostname}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{`https://${hostname}`}</a>
        </p>
    </div>
  );
}
