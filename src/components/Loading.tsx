import React from 'react';

const Loading = () => {
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
      background: '#fafafa',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30vw, -20vh) scale(1.2);
          }
          66% {
            transform: translate(-20vw, 30vh) scale(0.9);
          }
        }
        
        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-25vw, 25vh) scale(0.8);
          }
          66% {
            transform: translate(35vw, -15vh) scale(1.3);
          }
        }
        
        @keyframes float3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20vw, 30vh) scale(1.1);
          }
          66% {
            transform: translate(-30vw, -20vh) scale(0.85);
          }
        }
        
        @keyframes float4 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-15vw, -25vh) scale(1.15);
          }
          66% {
            transform: translate(25vw, 20vh) scale(0.95);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.05);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      
      {/* Floating gradient circles */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 234, 216, 0.6) 0%, rgba(245, 234, 216, 0) 70%)',
        filter: 'blur(60px)',
        animation: 'float1 20s ease-in-out infinite',
        top: '20%',
        left: '10%'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(229, 241, 241, 0.6) 0%, rgba(229, 241, 241, 0) 70%)',
        filter: 'blur(60px)',
        animation: 'float2 25s ease-in-out infinite',
        top: '50%',
        right: '15%'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(253, 224, 217, 0.6) 0%, rgba(253, 224, 217, 0) 70%)',
        filter: 'blur(60px)',
        animation: 'float3 22s ease-in-out infinite',
        bottom: '15%',
        left: '20%'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '480px',
        height: '480px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(254, 240, 220, 0.6) 0%, rgba(254, 240, 220, 0) 70%)',
        filter: 'blur(60px)',
        animation: 'float4 18s ease-in-out infinite',
        top: '30%',
        right: '25%'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '520px',
        height: '520px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(230, 243, 233, 0.6) 0%, rgba(230, 243, 233, 0) 70%)',
        filter: 'blur(60px)',
        animation: 'float1 23s ease-in-out infinite 2s',
        bottom: '25%',
        right: '10%'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(223, 228, 244, 0.6) 0%, rgba(223, 228, 244, 0) 70%)',
        filter: 'blur(60px)',
        animation: 'float2 21s ease-in-out infinite 3s',
        top: '40%',
        left: '30%'
      }} />
      
      {/* Loading text */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        fontSize: '14px',
        fontWeight: '600',
        color: '#888',
        letterSpacing: '2px',
        animation: 'pulse 2s ease-in-out infinite, fadeIn 0.5s ease-in'
      }}>
        Loading...
      </div>
    </div>
  );
};

export default Loading;