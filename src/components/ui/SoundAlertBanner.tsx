'use client';

import React from 'react';
import { useHotelEngineering } from '@/lib/store';
import { PriorityBadge } from './PriorityBadge';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export function SoundAlertBanner() {
  const {
    workOrders,
    hasUnacceptedNewOrders,
    isMuted,
    toggleMute,
    enableAudio,
    acceptWorkOrder,
    currentUser,
  } = useHotelEngineering();

  if (!hasUnacceptedNewOrders) return null;

  const newOrders = workOrders.filter(w => w.status === 'NEW');
  const latestNewOrder = newOrders[0];

  return (
    <div className="bg-red-600 text-white px-4 py-3 shadow-lg border-b-2 border-red-700 animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Alert Icon & Text */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white text-red-600 font-black shadow-sm shrink-0 animate-bounce">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm uppercase tracking-wider">
                🚨 NEW ENGINEERING REQUEST WAITING! ({newOrders.length})
              </span>
              {latestNewOrder && (
                <span className="bg-red-800 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                  {latestNewOrder.workOrderNumber}
                </span>
              )}
            </div>
            {latestNewOrder && (
              <p className="text-xs text-red-100 font-medium line-clamp-1 mt-0.5">
                📍 {latestNewOrder.location} {latestNewOrder.roomNumber ? `(Room ${latestNewOrder.roomNumber})` : ''} •{' '}
                <strong>{latestNewOrder.title}</strong> (Reported by {latestNewOrder.reportedBy})
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Mute / Unmute Button */}
          <button
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              isMuted
                ? 'bg-red-800 text-red-200 hover:bg-red-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isMuted ? 'Unmute alert chime' : 'Mute alert chime'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Unmute Sound' : 'Mute'}</span>
          </button>

          {/* Quick 1-Click Accept Button */}
          {latestNewOrder && (
            <button
              onClick={() => {
                enableAudio();
                acceptWorkOrder(latestNewOrder.id, currentUser.name);
              }}
              className="px-4 py-1.5 rounded-xl bg-white text-red-700 hover:bg-red-50 text-xs font-black shadow-md transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ACCEPT REQUEST</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
