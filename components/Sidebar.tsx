"use client";

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Clapperboard, CalendarClock, Search, Moon, Send } from 'lucide-react';
import React from 'react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contas', href: '/accounts', icon: Users },
  { name: 'Postagem em massa', href: '/postagem-massa', icon: Send },
  { name: 'Inspirações', href: '/inspiracoes', icon: Search },
  { name: 'Biblioteca', href: '/library', icon: Clapperboard },
  { name: 'Agendamento', href: '/schedule', icon: CalendarClock },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '260px',
      background: 'linear-gradient(180deg, rgba(8, 10, 16, 0.94) 0%, rgba(6, 8, 14, 0.88) 100%)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-color)',
      boxShadow: '4px 0 32px rgba(0, 0, 0, 0.35)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1rem',
      zIndex: 10,
    }}>
      <div style={{ marginBottom: '2.5rem', paddingLeft: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <Moon size={22} color="var(--accent-gold)" strokeWidth={1.75} />
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
          }}>
            <span style={{ color: 'var(--accent-gold)' }}>Wayne</span>
          </h1>
        </div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginLeft: '2rem',
        }}>
          Gotham Ops
        </p>
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          marginTop: '0.5rem',
          marginLeft: '0.15rem',
          fontWeight: 500,
          letterSpacing: '0.04em',
        }}>
          Automations
        </p>
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
                backgroundColor: isActive ? 'rgba(201, 162, 39, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(201, 162, 39, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(201, 162, 39, 0.06)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <item.icon size={20} color={isActive ? 'var(--accent-gold)' : 'currentColor'} />
              {item.name}
            </NextLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingLeft: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          Wayne Enterprises
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Build v1.0 · Gotham City</p>
      </div>
    </aside>
  );
}
