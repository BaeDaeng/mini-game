import React from 'react';
import Cigarette from './Cigarette';
import Chat from './Chat';
import './TabaccoRoom.css';

export default function TabaccoRoom() {
  return (
    <div className="tabacco-room">
      <Cigarette />
      <Chat />
    </div>
  );
}