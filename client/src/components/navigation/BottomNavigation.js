import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const BottomNavigation = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Farklı kullanıcı rolleri için gezinme öğeleri
  const navigationItems = [
    { name: 'Ana Sayfa', to: '/', icon: HomeIcon },
    { name: 'Destek Kayıtları', to: '/tickets', icon: DocumentDuplicateIcon },
    { name: 'Yeni Kayıt', to: '/tickets/new', icon: PlusCircleIcon },
  ];

  // Admin için ek ö