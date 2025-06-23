import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Input, Select, Modal, message, Progress, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { Plus, Search, RefreshCw, Euro } from 'lucide-react';
import { Project, Expense, ExpensePayment } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { ExpenseFormModal } from '../../components/admin/ExpenseFormModal';
import { ExpensePaymentModal } from '../../components/admin/ExpensePaymentModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { confirm } = Modal;

export const ExpenseManagement: React.FC = () => {
  const { t } = useTranslation();
  const {
    projects,
    isLoading,
    deleteExpense,
    updateExpense,
    addExpense,
    addExpensePayment,
    updateExpensePayment,
    deleteExpensePayment
  } = useProjectStore();

  const [searchText, setSearchText] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [editingExpense, setEditingExpense] = useState<Expense & { projectName: string } | null>(null);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ExpensePayment | null>(null);

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
    setIsExpenseModalVisible(true);
  };

  const handleCreate = () => {
    setEditingExpense(null);
    setIsExpenseModalVisible(true);
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
      setIsExpenseModalVisible(false);
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleAddPayment = async (payment: Omit<ExpensePayment, 'id' | 'expenseId'>) => {
    if (!editingExpense) return;
    try {
      await addExpensePayment(editingExpense.projectId, editingExpense.id, payment);
      message.success(t('common.success'));
      setIsPaymentModalVisible(false);
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleUpdatePayment = async (payment: Partial<ExpensePayment>) => {
    if (!editingExpense || !selectedPayment) return;
    try {
      await updateExpensePayment(
          editingExpense.projectId,
          editingExpense.id,
          selectedPayment.id,
          payment
      );
      message.success(t('common.success'));
      setIsPaymentModalVisible(false);
      setSelectedPayment(null);
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleDeletePayment = async (payment: ExpensePayment) => {
    if (!editingExpense) return;
    try {
      await deleteExpensePayment(editingExpense.projectId, editingExpense.id, payment.id);
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
      key: 'amount',
      render: (text: string, record: Expense) => (
          <div className="space-y-1">
            <div className="font-medium">€{record.amount.toFixed(2)}</div>
            {record.paidAmount !== undefined && (
                <Tooltip title={`${record.paidAmount.toFixed(2)}€ / ${record.amount.toFixed(2)}€`}>
                  <Progress
                      percent={(record.paidAmount / record.amount) * 100}
                      size="small"
                      showInfo={false}
                      status={
                        record.status === 'paid' ? 'success' :
                            record.status === 'partially-paid' ? 'active' : 'exception'
                      }
                  />
                </Tooltip>
            )}
          </div>
      ),
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
      title: t('admin.expenses.status'),
      key: 'status',
      render: (text: string, record: Expense) => (
          <Tag color={
            record.status === 'paid' ? 'success' :
                record.status === 'partially-paid' ? 'warning' : 'default'
          }>
            {t(`admin.expenses.status.${record.status || 'unpaid'}`)}
          </Tag>
      ),
      filters: [
        { text: t('admin.expenses.status.paid'), value: 'paid' },
        { text: t('admin.expenses.status.partiallyPaid'), value: 'partially-paid' },
        { text: t('admin.expenses.status.unpaid'), value: 'unpaid' }
      ],
      onFilter: (value: string, record: Expense) => record.status === value
    },
    {
      title: t('admin.expenses.recurring'),
      key: 'recurring',
      render: (text: string, record: Expense) => record.isRecurring && (
          <Tag icon={<RefreshCw size={12} />} color="blue">
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
            <Button
                type="primary"
                onClick={() => {
                  setEditingExpense(record);
                  setSelectedPayment(null);
                  setIsPaymentModalVisible(true);
                }}
            >
              {t('admin.expenses.payments.add')}
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
            visible={isExpenseModalVisible}
            onClose={() => setIsExpenseModalVisible(false)}
            onSubmit={handleSubmit}
            loading={isLoading}
            projects={projects}
        />

        <ExpensePaymentModal
            payment={selectedPayment || undefined}
            visible={isPaymentModalVisible}
            onClose={() => {
              setIsPaymentModalVisible(false);
              setSelectedPayment(null);
            }}
            onSubmit={selectedPayment ? handleUpdatePayment : handleAddPayment}
            loading={isLoading}
        />
      </div>
  );
};
