import React, { useEffect } from 'react';

interface AdUnitProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdUnit: React.FC<AdUnitProps> = ({ 
  slot, 
  format = "auto", 
  responsive = true, 
  style = { display: 'block' },
  className = ""
}) => {
  useEffect(() => {
    try {
      // Initialize adsbygoogle array if it doesn't exist
      window.adsbygoogle = window.adsbygoogle || [];
      
      // Push the ad configuration
      window.adsbygoogle.push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins 
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client="ca-pub-9511068587826142"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive.toString()}
    />
  );
};

export default AdUnit;