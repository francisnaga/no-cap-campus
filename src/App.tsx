import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Shell, NavTab } from './components/layout/Shell.tsx';
import { HomeScreen } from './components/screens/HomeScreen.tsx';
import { DailyScreen } from './components/screens/DailyScreen.tsx';
import { PlayScreen } from './components/screens/PlayScreen.tsx';
import { CirclesScreen } from './components/screens/CirclesScreen.tsx';
import { RankingsScreen } from './components/screens/RankingsScreen.tsx';
import { ProfileScreen } from './components/screens/ProfileScreen.tsx';
import { AdminScreen } from './components/screens/AdminScreen.tsx';
import { RoomScreen } from './components/screens/RoomScreen.tsx';

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('daily');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [showCreateModalFromHome, setShowCreateModalFromHome] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check URL query parameters for deep-linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinRoomCode = params.get('joinRoom') || params.get('room');
    if (joinRoomCode) {
      setActiveRoomCode(joinRoomCode.toUpperCase());
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenRoom = (code: string) => {
    setActiveRoomCode(code.toUpperCase());
  };

  const handleLeaveRoom = () => {
    setActiveRoomCode(null);
    setCurrentTab('play');
  };

  return (
    <Shell
      currentTab={currentTab}
      onSelectTab={(tab) => {
        if (activeRoomCode) {
          // If navigating away from active room, keep room code saved for easy resume
          setActiveRoomCode(null);
        }
        setCurrentTab(tab);
      }}
      activeRoomCode={activeRoomCode}
      onOpenRoom={handleOpenRoom}
      toastMessage={toastMessage}
      onClearToast={() => setToastMessage(null)}
    >
      {activeRoomCode ? (
        <RoomScreen
          roomCode={activeRoomCode}
          onLeaveRoom={handleLeaveRoom}
        />
      ) : (
        <>
          {currentTab === 'daily' && (
            <DailyScreen
              onNavigateToLeaderboard={() => setCurrentTab('circles')}
            />
          )}

          {currentTab === 'play' && (
            <PlayScreen
              onJoinRoom={handleOpenRoom}
              onRoomCreated={(code) => {
                handleOpenRoom(code);
                showToast(`Room ${code} created!`);
              }}
              showCreateModalInitial={showCreateModalFromHome}
              onCloseCreateModalInitial={() => setShowCreateModalFromHome(false)}
            />
          )}

          {currentTab === 'circles' && (
            <CirclesScreen
              onStartLiveGameWithCircle={() => {
                setCurrentTab('play');
              }}
            />
          )}

          {currentTab === 'home' && (
            <DailyScreen
              onNavigateToLeaderboard={() => setCurrentTab('circles')}
            />
          )}

          {currentTab === 'rankings' && (
            <CirclesScreen defaultSubTab="rankings" />
          )}

          {currentTab === 'profile' && <ProfileScreen />}

          {currentTab === 'admin' && <AdminScreen />}
        </>
      )}
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
