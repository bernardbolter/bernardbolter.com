import React from 'react';

// Using $background: #FDFEFF; from vars.scss
const BACKGROUND_COLOR = '#FDFEFF'; 

// Series Colors from vars.scss:
const COLORS = {
  sold: '#d4af37', 
  war: '#6D2E46',  
  ach: '#9DC3C2',  
  meg: '#FC7753',  
  dcs: '#F6BD60',  
  van: '#7B8CDE',  
  pho: '#2D4654',  
};
const TEXT_COLOR = '#393B3E'; // $dark from vars.scss

const NoArtwork = () => {
  // Use '33' for ~20% opacity (0x33 / 0xFF approx 0.2)
  const OPACITY_HEX = '33'; 

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: BACKGROUND_COLOR, 
      overflow: 'hidden'
    }}>
      <style>{`
        /* Existing float keyframes */
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30vw, -20vh) scale(1.2); }
          66% { transform: translate(-20vw, 30vh) scale(0.9); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25vw, 25vh) scale(0.8); }
          66% { transform: translate(35vw, -15vh) scale(1.3); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20vw, 30vh) scale(1.1); }
          66% { transform: translate(-30vw, -20vh) scale(0.85); }
        }
        
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-15vw, -25vh) scale(1.15); }
          66% { transform: translate(25vw, 20vh) scale(0.95); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      {/* Floating gradient circles (20% opacity) */}

      {/* 1. sold - Yellow-Green */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.sold}${OPACITY_HEX} 0%, ${COLORS.sold}00 70%)`, 
        filter: 'blur(70px)',
        animation: 'float1 20s ease-in-out infinite',
        top: '20%',
        left: '10%'
      }} />
      
      {/* 2. war - Deep Red/Maroon */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.war}${OPACITY_HEX} 0%, ${COLORS.war}00 70%)`,
        filter: 'blur(70px)',
        animation: 'float2 25s ease-in-out infinite',
        top: '50%',
        right: '15%'
      }} />
      
      {/* 3. ach - Light Blue-Gray */}
      <div style={{
        position: 'absolute',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.ach}${OPACITY_HEX} 0%, ${COLORS.ach}00 70%)`,
        filter: 'blur(70px)',
        animation: 'float3 22s ease-in-out infinite',
        bottom: '15%',
        left: '20%'
      }} />
      
      {/* 4. meg - Coral/Orange */}
      <div style={{
        position: 'absolute',
        width: '480px',
        height: '480px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.meg}${OPACITY_HEX} 0%, ${COLORS.meg}00 70%)`,
        filter: 'blur(70px)',
        animation: 'float4 18s ease-in-out infinite',
        top: '30%',
        right: '25%'
      }} />
      
      {/* 5. van - Medium Blue/Lavender (Delayed float1) */}
      <div style={{
        position: 'absolute',
        width: '520px',
        height: '520px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.van}${OPACITY_HEX} 0%, ${COLORS.van}00 70%)`,
        filter: 'blur(70px)',
        animation: 'float1 23s ease-in-out infinite 2s',
        bottom: '25%',
        right: '10%'
      }} />
      
      {/* 6. pho - Dark Blue/Slate (Delayed float2) */}
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.pho}${OPACITY_HEX} 0%, ${COLORS.pho}00 70%)`,
        filter: 'blur(70px)',
        animation: 'float2 21s ease-in-out infinite 3s',
        top: '40%',
        left: '30%'
      }} />
      
      {/* No Artworks text - plain, dark text */}
      <div style={{
        position: 'relative',
        zIndex: 20, 
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease-in', 
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: TEXT_COLOR, 
          letterSpacing: '4px',
          textTransform: 'uppercase',
          margin: '0 0 10px 0',
        }}>
          No Artworks Found.
        </h1>
        <p style={{
          fontSize: '16px',
          color: TEXT_COLOR, 
          letterSpacing: '2px',
          opacity: 0.8,
          margin: 0,
        }}>
          Try refreshing, or adjust the filters.
        </p>
      </div>
    </div>
  );
};

export default NoArtwork;