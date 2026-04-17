"use client";

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Clapperboard, CalendarClock, Search } from 'lucide-react';
import React from 'react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contas', href: '/accounts', icon: Users },
  { name: 'Inspirações', href: '/inspiracoes', icon: Search },
  { name: 'Biblioteca', href: '/library', icon: Clapperboard },
  { name: 'Agendamento', href: '/schedule', icon: CalendarClock },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-color)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1rem',
      zIndex: 10,
    }}>
      <div style={{ marginBottom: '3rem', paddingLeft: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-color)' }}>WAYNE</span> Automations
        </h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NextLink
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <item.icon size={20} color={isActive ? 'var(--accent-color)' : 'currentColor'} />
              {item.name}
            </NextLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        <p>Beta v1.0.0</p>
      </div>
    </aside>
  );
}
