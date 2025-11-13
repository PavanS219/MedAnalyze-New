import { useState } from 'react';
import { LandingPage } from '@/components/LandingPage';
import MedAnalyzeApp from '@/components/MedAnalyzeApp';

const Index = () => {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <MedAnalyzeApp />;
  }

  return <LandingPage onEnterApp={() => setShowApp(true)} />;
};

export default Index;
