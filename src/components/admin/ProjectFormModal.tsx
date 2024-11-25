import React from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Select, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { Project, ProjectType } from '../../types/project';
import dayjs from 'dayjs';
import {JiraEpicSelector} from "../JiraEpicSelector.tsx";

interface ProjectFormModalProps {
  project?: Project;
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Project>) => Promise<void>;
  loading?: boolean;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
                                                                    project,
                                                                    visible,
                                                                    onClose,
                                                                    onSubmit,
                                                                    loading
                                                                  }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [projectType, setProjectType] = React.useState<ProjectType>(project?.type || 'time-based');

  React.useEffect(() => {
    if (project) {
      form.setFieldsValue({
        ...project,
        startDate: dayjs(project.startDate),
        endDate: dayjs(project.endDate),
        jiraEpic: project.jiraEpicId ? {
          jiraEpicId: project.jiraEpicId,
          jiraEpicKey: project.jiraEpicKey,
          jiraEpicName: project.jiraEpicName,
          jiraProjectKey: project.jiraProjectKey
        } : undefined
      });
      setProjectType(project.type);
    } else {
      form.resetFields();
      setProjectType('time-based');
    }
  }, [project, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const jiraEpic = values.jiraEpic;
      delete values.jiraEpic;

      await onSubmit({
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        ...(jiraEpic ? {
          jiraEpicId: jiraEpic.jiraEpicId,
          jiraEpicKey: jiraEpic.jiraEpicKey,
          jiraEpicName: jiraEpic.jiraEpicName,
          jiraProjectKey: jiraEpic.jiraProjectKey
        } : {})
      });
      onClose();
    } catch (error) {
      // Form validation error
    }
  };

  return (
      <Modal
          title={project ? t('admin.projects.edit') : t('admin.projects.create')}
          open={visible}
          onCancel={onClose}
          onOk={handleSubmit}
          confirmLoading={loading}
          width={800}
      >
        <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: 'active',
              type: 'time-based'
            }}
        >
          <Form.Item
              name="name"
              label={t('admin.projects.name')}
              rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
              name="client"
              label={t('admin.projects.client')}
              rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
              name="type"
              label="Project Type"
              rules={[{ required: true }]}
          >
            <Radio.Group onChange={(e) => setProjectType(e.target.value)}>
              <Radio.Button value="time-based">Time-based</Radio.Button>
              <Radio.Button value="fixed-price">Fixed Price</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {projectType === 'time-based' ? (
              <Form.Item
                  name="totalHours"
                  label={t('common.totalHours')}
                  rules={[{ required: true }]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>
          ) : (
              <Form.Item
                  name="budget"
                  label="Budget"
                  rules={[{ required: true }]}
              >
                <InputNumber
                    min={1}
                    className="w-full"
                    formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/€\s?|(,*)/g, '')}
                />
              </Form.Item>
          )}

          <Form.Item
              name="status"
              label={t('admin.projects.status')}
              rules={[{ required: true }]}
          >
            <Select
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'On Hold', value: 'on-hold' }
                ]}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
                name="startDate"
                label={t('admin.projects.startDate')}
                rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
                name="endDate"
                label={t('admin.projects.endDate')}
                rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.Item
              name="jiraEpic"
              label="Link Jira Epic"
          >
            <JiraEpicSelector />
          </Form.Item>
        </Form>
      </Modal>
  );
};
