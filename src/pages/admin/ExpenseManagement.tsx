import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Input, Select, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { Plus, Search, RefreshCcw } from 'lucide-react';
import { Project, Expense } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { ExpenseFormModal } from '../../components/admin/ExpenseFormModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { confirm } = Modal;

export const ExpenseManagement: React.FC = () => {
  const { t } = useTranslation();
  const { projects, isLoading, deleteExpense, updateExpense, addExpense } = useProjectStore();
  const [searchText, setSearchText] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [editingExpense, setEditingExpense] = useState<Expense & { projectName: string } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDelete = (expense: Expense & { projectName: string }) => {
    confirm({
      title: t('admin.common.confirmDelete'),
      content: `${t('admin.expenses.description')}: ${expense.description}`,
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      async onOk() {
        try {
          await deleteExpense(expense.projectId, expense.id);
          message.success(t('common.success'));
        } catch (error) {
          message.error(t('common.error'));
        }
      },
    });
  };

  const handleEdit = (expense: Expense & { projectName: string }) => {
    setEditingExpense(expense);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setEditingExpense(null);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: Partial<Expense>) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.projectId, {
          ...editingExpense,
          ...values
        });
      } else if (values.projectId) {
        await addExpense(values.projectId, values as Omit<Expense, 'id' | 'projectId'>);
      }
      message.success(t('common.success'));
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const allExpenses = projects.flatMap(project => 
    project.expenses.map(expense => ({
      ...expense,
      projectName: project.name
    }))
  );

  const columns = [
    {
      title: t('admin.projects.name'),
      dataIndex: 'projectName',
      key: 'projectName',
      sorter: (a: any, b: any) => a.projectName.localeCompare(b.projectName)
    },
    {
      title: t('admin.expenses.description'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: t('admin.expenses.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `€${amount.toFixed(2)}`,
      sorter: (a: Expense, b: Expense) => a.amount - b.amount
    },
    {
      title: t('admin.expenses.category'),
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Hosting', value: 'Hosting' },
        { text: 'Software Licenses', value: 'Software Licenses' },
        { text: 'Infrastructure', value: 'Infrastructure' },
        { text: 'Other', value: 'Other' }
      ],
      onFilter: (value: string, record: Expense) => record.category === value
    },
    {
      title: t('admin.expenses.recurring'),
      key: 'recurring',
      render: (text: string, record: Expense) => record.isRecurring && (
        <Tag icon={<RefreshCcw size={12} />} color="blue">
          {record.recurringInterval}
        </Tag>
      )
    },
    {
      title: t('admin.expenses.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
      sorter: (a: Expense, b: Expense) => dayjs(a.date).unix() - dayjs(b.date).unix()
    },
    {
      title: t('admin.common.actions'),
      key: 'actions',
      render: (text: string, record: Expense & { projectName: string }) => (
        <Space>
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

  const filteredExpenses = allExpenses.filter(expense =>
    (selectedProject === 'all' || expense.projectId === selectedProject) &&
    (expense.description.toLowerCase().includes(searchText.toLowerCase()) ||
     expense.category.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Title level={3} className="!m-0">{t('admin.expenses.title')}</Title>
      
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
              value={selectedProject}
              onChange={setSelectedProject}
              options={[
                { label: 'All Projects', value: 'all' },
                ...projects.map(project => ({
                  label: project.name,
                  value: project.id
                }))
              ]}
            />
          </div>
          <Button type="primary" icon={<Plus size={16} />} onClick={handleCreate}>
            {t('admin.expenses.create')}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredExpenses}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`
          }}
        />
      </Card>

      <ExpenseFormModal
        expense={editingExpense || undefined}
        projectId={selectedProject !== 'all' ? selectedProject : undefined}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
        loading={isLoading}
        projects={projects}
      />
    </div>
  );
};