import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Input, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Users, Hourglass, Lock, Euro } from 'lucide-react';
import { Project, ProjectAssignment } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore } from '../../store/userStore';
import { ProjectFormModal } from '../../components/admin/ProjectFormModal';
import { ProjectAssignmentModal } from '../../components/admin/ProjectAssignmentModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { confirm } = Modal;

export const ProjectManagement: React.FC = () => {
  const { t } = useTranslation();
  const { projects, isLoading, deleteProject, updateProject, createProject } = useProjectStore();
  const { users, fetchUsers } = useUserStore();
  const [searchText, setSearchText] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignmentModalVisible, setIsAssignmentModalVisible] = useState(false);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = (project: Project) => {
    confirm({
      title: t('admin.common.confirmDelete'),
      content: `${t('admin.projects.name')}: ${project.name}`,
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      async onOk() {
        try {
          await deleteProject(project.id);
          message.success(t('common.success'));
        } catch (error) {
          message.error(t('common.error'));
        }
      },
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: Partial<Project>) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, values);
      } else {
        await createProject(values as Omit<Project, 'id' | 'timeEntries' | 'expenses' | 'assignments'>);
      }
      message.success(t('common.success'));
      setIsModalVisible(false);
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleAssign = async (assignment: ProjectAssignment) => {
    if (!editingProject) return;

    try {
      await updateProject(editingProject.id, {
        assignments: [...(editingProject.assignments || []), assignment]
      });
      message.success('User assigned successfully');
    } catch (error) {
      message.error('Failed to assign user');
    }
  };

  const handleRemoveAssignment = async (userId: string) => {
    if (!editingProject) return;

    try {
      await updateProject(editingProject.id, {
        assignments: editingProject.assignments.filter(a => a.userId !== userId)
      });
      message.success('User removed successfully');
    } catch (error) {
      message.error('Failed to remove user');
    }
  };

  const handleManageAssignments = (project: Project) => {
    setEditingProject(project);
    setIsAssignmentModalVisible(true);
  };

  const columns = [
    {
      title: t('admin.projects.name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Project) => (
          <div className="space-y-1">
            <div>{name}</div>
            <Space>
              <Tag icon={record.type === 'time-based' ? <Hourglass size={12} /> : <Lock size={12} />}>
                {record.type === 'time-based' ? 'Time-based' : 'Fixed Price'}
              </Tag>
              {record.type === 'fixed-price' && (
                  <Tag icon={<Euro size={12} />} color="green">
                    €{record.budget?.toLocaleString()}
                  </Tag>
              )}
            </Space>
          </div>
      ),
      sorter: (a: Project, b: Project) => a.name.localeCompare(b.name)
    },
    {
      title: t('admin.projects.client'),
      dataIndex: 'client',
      key: 'client',
      sorter: (a: Project, b: Project) => a.client.localeCompare(b.client)
    },
    {
      title: t('admin.projects.hours'),
      key: 'hours',
      render: (text: string, record: Project) => {
        if (record.type === 'time-based') {
          return <span>{record.usedHours} / {record.totalHours}</span>;
        }
        const completedTasks = record.timeEntries.filter(entry => entry.status === 'done').length;
        return `${completedTasks} / ${record.timeEntries.length} tasks`;
      }
    },
    {
      title: t('admin.projects.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: Project['status']) => (
          <Tag color={status === 'active' ? 'green' : status === 'completed' ? 'blue' : 'orange'}>
            {status.toUpperCase()}
          </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Completed', value: 'completed' },
        { text: 'On Hold', value: 'on-hold' }
      ],
      onFilter: (value: string, record: Project) => record.status === value
    },
    {
      title: t('admin.projects.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
      sorter: (a: Project, b: Project) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix()
    },
    {
      title: 'Team',
      key: 'team',
      render: (text: string, record: Project) => (
          <div className="flex -space-x-2">
            {record.assignments.slice(0, 3).map((assignment) => {
              const user = users.find(u => u.id === assignment.userId);
              return user?.avatar ? (
                  <img
                      key={user.id}
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white"
                      title={`${user.name} (${assignment.role})`}
                  />
              ) : (
                  <div
                      key={user?.id}
                      className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white text-sm"
                      title={`${user?.name} (${assignment.role})`}
                  >
                    {user?.name.charAt(0)}
                  </div>
              );
            })}
            {record.assignments.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 text-sm">
                  +{record.assignments.length - 3}
                </div>
            )}
          </div>
      )
    },
    {
      title: t('admin.common.actions'),
      key: 'actions',
      render: (text: string, record: Project) => (
          <Space>
            <Button
                type="text"
                icon={<Users size={16} />}
                onClick={() => handleManageAssignments(record)}
            >
              Team
            </Button>
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('admin.common.edit')}
            </Button>
            <Button
                type="link"
                danger
                onClick={() => handleDelete(record)}
            >
              {t('admin.common.delete')}
            </Button>
          </Space>
      )
    }
  ];

  const filteredProjects = projects.filter(project =>
      project.name.toLowerCase().includes(searchText.toLowerCase()) ||
      project.client.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
      <div className="space-y-6">
        <Title level={3} className="!m-0">{t('admin.projects.title')}</Title>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-md">
              <Input
                  prefix={<Search size={16} className="text-gray-400" />}
                  placeholder={t('admin.common.search')}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
              />
            </div>
            <Button type="primary" icon={<Plus size={16} />} onClick={handleCreate}>
              {t('admin.projects.create')}
            </Button>
          </div>

          <Table
              columns={columns}
              dataSource={filteredProjects}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`
              }}
          />
        </Card>

        <ProjectFormModal
            project={editingProject || undefined}
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSubmit={handleSubmit}
            loading={isLoading}
        />

        <ProjectAssignmentModal
            visible={isAssignmentModalVisible}
            onClose={() => setIsAssignmentModalVisible(false)}
            onAssign={handleAssign}
            onRemove={handleRemoveAssignment}
            assignments={editingProject?.assignments || []}
            users={users}
            loading={isLoading}
        />
      </div>
  );
};
