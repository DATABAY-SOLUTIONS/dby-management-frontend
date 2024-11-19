import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Input, Select, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { Plus, Search } from 'lucide-react';
import { User } from '../../types/user';
import { UserFormModal } from '../../components/admin/UserFormModal';
import { useUserStore } from '../../store/userStore';
import dayjs from 'dayjs';

const { Title } = Typography;
const { confirm } = Modal;

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser } = useUserStore();
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = (user: User) => {
    if (user.role === 'admin') {
      message.error('Cannot delete admin users');
      return;
    }

    confirm({
      title: t('admin.common.confirmDelete'),
      content: `${t('admin.users.name')}: ${user.name}`,
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk() {
        deleteUser(user.id)
          .then(() => message.success('User deleted successfully'))
          .catch(() => message.error('Failed to delete user'));
      },
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: Partial<User>) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success('User updated successfully');
      } else {
        await createUser(values as Omit<User, 'id' | 'createdAt' | 'lastLogin'>);
        message.success('User created successfully');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const columns = [
    {
      title: t('admin.users.name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <div className="flex items-center gap-2">
          {record.avatar ? (
            <img src={record.avatar} alt={name} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {name.charAt(0)}
            </div>
          )}
          <span>{name}</span>
        </div>
      ),
      sorter: (a: User, b: User) => a.name.localeCompare(b.name)
    },
    {
      title: t('admin.users.email'),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: t('admin.users.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: User['role']) => (
        <Tag color={role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'default'}>
          {role.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'User', value: 'user' }
      ],
      onFilter: (value: string, record: User) => record.role === value
    },
    {
      title: t('admin.users.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: User['status']) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ],
      onFilter: (value: string, record: User) => record.status === value
    },
    {
      title: t('admin.users.lastLogin'),
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => date ? dayjs(date).format('MMM D, YYYY HH:mm') : '-',
      sorter: (a: User, b: User) => {
        if (!a.lastLogin) return 1;
        if (!b.lastLogin) return -1;
        return dayjs(a.lastLogin).unix() - dayjs(b.lastLogin).unix();
      }
    },
    {
      title: t('admin.common.actions'),
      key: 'actions',
      render: (text: string, record: User) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            {t('admin.common.edit')}
          </Button>
          <Button 
            type="link" 
            danger 
            disabled={record.role === 'admin'}
            onClick={() => handleDelete(record)}
          >
            {t('admin.common.delete')}
          </Button>
        </Space>
      )
    }
  ];

  const filteredUsers = users.filter(user =>
    (roleFilter === 'all' || user.role === roleFilter) &&
    (user.name.toLowerCase().includes(searchText.toLowerCase()) ||
     user.email.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Title level={3} className="!m-0">{t('admin.users.title')}</Title>
      
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 flex-1 max-w-2xl">
            <Input
              prefix={<Search size={16} className="text-gray-400" />}
              placeholder={t('admin.common.search')}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Select
              className="min-w-[200px]"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { label: 'All Roles', value: 'all' },
                { label: 'Admin', value: 'admin' },
                { label: 'Manager', value: 'manager' },
                { label: 'User', value: 'user' }
              ]}
            />
          </div>
          <Button type="primary" icon={<Plus size={16} />} onClick={handleCreate}>
            {t('admin.users.create')}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`
          }}
        />
      </Card>

      <UserFormModal
        user={editingUser || undefined}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
        loading={isLoading}
      />
    </div>
  );
};