import React, { useState } from 'react';
import { Menu, Avatar, Dropdown, Switch, Badge, Select } from 'antd';
import { User, LogOut, Settings, Bell, Mail, MessageSquare, Globe, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getRolePermissions } from '../types/user';
import { UnreadMessagesDrawer } from './UnreadMessagesDrawer';
import type { MenuProps } from 'antd';

export const UserMenu: React.FC = () => {
    const { user, isAuthenticated, logout, updateUserSettings, unreadMessages } = useAuthStore();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isMessagesDrawerVisible, setIsMessagesDrawerVisible] = useState(false);

    const permissions = getRolePermissions(user?.role || 'user');
    const canAccessAdmin = permissions.canManageProjects || permissions.canManageUsers || permissions.canManageExpenses;

    const handleMenuClick = (e: { key: string; domEvent: React.MouseEvent }) => {
        e.domEvent.stopPropagation();
        switch (e.key) {
            case 'logout':
                logout();
                break;
            case 'admin':
                navigate('/admin');
                break;
            case 'messages':
                setIsMessagesDrawerVisible(true);
                break;
        }
    };

    const menuItems: MenuProps['items'] = isAuthenticated && user ? [
        {
            key: 'user-info',
            label: (
                <div className="px-4 py-2">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                </div>
            ),
            type: 'group'
        },
        { type: 'divider' },
        canAccessAdmin && {
            key: 'admin',
            icon: <LayoutDashboard size={16} />,
            label: t('admin.title')
        },
        {
            key: 'messages',
            label: (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={16} />
                        <span>{t('menu.messages')}</span>
                    </div>
                    {unreadMessages > 0 && (
                        <Badge count={unreadMessages} size="small" />
                    )}
                </div>
            )
        },
        {
            key: 'notifications',
            label: (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Bell size={16} />
                        <span>{t('menu.notifications')}</span>
                    </div>
                    <Switch
                        size="small"
                        checked={user.settings.notifications}
                        onChange={(checked) => {
                            updateUserSettings({ notifications: checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )
        },
        {
            key: 'emailUpdates',
            label: (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{t('menu.emailUpdates')}</span>
                    </div>
                    <Switch
                        size="small"
                        checked={user.settings.emailUpdates}
                        onChange={(checked) => {
                            updateUserSettings({ emailUpdates: checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )
        },
        {
            key: 'language',
            label: (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Globe size={16} />
                        <span>{t('menu.language')}</span>
                    </div>
                    <Select
                        size="small"
                        value={i18n.language}
                        style={{ width: 100 }}
                        onChange={(value) => i18n.changeLanguage(value)}
                        onClick={(e) => e.stopPropagation()}
                        options={[
                            { label: t('menu.english'), value: 'en' },
                            { label: t('menu.spanish'), value: 'es' }
                        ]}
                    />
                </div>
            )
        },
        {
            key: 'settings',
            icon: <Settings size={16} />,
            label: t('auth.accountSettings')
        },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogOut size={16} />,
            label: t('auth.logout'),
            className: 'text-red-500 hover:text-red-600'
        }
    ].filter(Boolean) : [
        {
            key: 'login',
            icon: <User size={16} />,
            label: t('auth.login')
        }
    ];

    return (
        <>
            <Dropdown
                menu={{
                    items: menuItems,
                    onClick: handleMenuClick
                }}
                trigger={['click']}
                placement="bottomRight"
            >
                <div className="cursor-pointer">
                    <Badge dot={unreadMessages > 0}>
                        {isAuthenticated && user ? (
                            <Avatar src={user.avatar} alt={user.name} />
                        ) : (
                            <Avatar icon={<User size={16} />} />
                        )}
                    </Badge>
                </div>
            </Dropdown>

            <UnreadMessagesDrawer
                visible={isMessagesDrawerVisible}
                onClose={() => setIsMessagesDrawerVisible(false)}
            />
        </>
    );
};
