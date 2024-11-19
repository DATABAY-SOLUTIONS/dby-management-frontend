import React from 'react';
import { Modal, Form, Select, Button, Table, Space, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { User } from '../../types/user';
import { ProjectAssignment } from '../../types/project';
import { Plus, UserMinus } from 'lucide-react';

interface ProjectAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onAssign: (assignment: ProjectAssignment) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  assignments: ProjectAssignment[];
  users: User[];
  loading?: boolean;
}

export const ProjectAssignmentModal: React.FC<ProjectAssignmentModalProps> = ({
  visible,
  onClose,
  onAssign,
  onRemove,
  assignments,
  users,
  loading
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onAssign(values);
      form.resetFields();
    } catch (error) {
      // Form validation error
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => {
        const user = users.find(u => u.id === userId);
        return (
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.name.charAt(0)}
              </div>
            )}
            <div>
              <div>{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: ProjectAssignment['role']) => (
        <Tag color={
          role === 'project-manager' ? 'blue' :
          role === 'developer' ? 'green' : 'default'
        }>
          {role.replace('-', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ProjectAssignment) => (
        <Button
          type="text"
          danger
          icon={<UserMinus size={16} />}
          onClick={() => onRemove(record.userId)}
        >
          Remove
        </Button>
      )
    }
  ];

  const availableUsers = users.filter(
    user => !assignments.find(a => a.userId === user.id)
  );

  return (
    <Modal
      title="Manage Project Assignments"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="space-y-6">
        <Form
          form={form}
          layout="inline"
          className="w-full"
        >
          <Form.Item
            name="userId"
            className="flex-1"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select user"
              options={availableUsers.map(user => ({
                label: user.name,
                value: user.id
              }))}
            />
          </Form.Item>

          <Form.Item
            name="role"
            className="flex-1"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select role"
              options={[
                { label: 'Project Manager', value: 'project-manager' },
                { label: 'Developer', value: 'developer' },
                { label: 'Viewer', value: 'viewer' }
              ]}
            />
          </Form.Item>

          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleSubmit}
            loading={loading}
          >
            Add User
          </Button>
        </Form>

        <Table
          columns={columns}
          dataSource={assignments}
          rowKey="userId"
          pagination={false}
          loading={loading}
        />
      </div>
    </Modal>
  );
};