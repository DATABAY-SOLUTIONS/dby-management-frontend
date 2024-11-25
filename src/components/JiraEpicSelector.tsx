import React, { useState, useEffect } from 'react';
import { Select, Input, Space, Tag } from 'antd';
import {JiraEpic} from "../types/jira.ts";
import {jiraService} from "../services/jira.ts";


interface JiraEpicSelectorProps {
    value?: {
        jiraEpicId: string;
        jiraEpicKey: string;
        jiraEpicName: string;
        jiraProjectKey: string;
    };
    onChange?: (value: {
        jiraEpicId: string;
        jiraEpicKey: string;
        jiraEpicName: string;
        jiraProjectKey: string;
    } | undefined) => void;
}

export const JiraEpicSelector: React.FC<JiraEpicSelectorProps> = ({
                                                                      value,
                                                                      onChange
                                                                  }) => {
    const [projectKey, setProjectKey] = useState(value?.jiraProjectKey || '');
    const [epics, setEpics] = useState<JiraEpic[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (projectKey) {
            setLoading(true);
            jiraService.getEpics(projectKey)
                .then((data: React.SetStateAction<JiraEpic[]>) => setEpics(data))
                .catch(() => setEpics([]))
                .finally(() => setLoading(false));
        } else {
            setEpics([]);
        }
    }, [projectKey]);

    const handleProjectKeyChange = (newProjectKey: string) => {
        setProjectKey(newProjectKey);
        onChange?.(undefined);
    };

    const handleEpicSelect = (epicId: string) => {
        const epic = epics.find(e => e.id === epicId);
        if (epic) {
            onChange?.({
                jiraEpicId: epic.id,
                jiraEpicKey: epic.key,
                jiraEpicName: epic.name,
                jiraProjectKey: epic.projectKey
            });
        }
    };

    return (
        <Space direction="vertical" className="w-full">
            <Input
                placeholder="Enter Jira Project Key (e.g., PROJ)"
                value={projectKey}
                onChange={e => handleProjectKeyChange(e.target.value.toUpperCase())}
                style={{ width: '100%' }}
            />

            <Select
                placeholder="Select Jira Epic"
                loading={loading}
                disabled={!projectKey || loading}
                style={{ width: '100%' }}
                value={value?.jiraEpicId}
                onChange={handleEpicSelect}
                allowClear
                onClear={() => onChange?.(undefined)}
            >
                {epics.map(epic => (
                    <Select.Option key={epic.id} value={epic.id}>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Tag color="blue">{epic.key}</Tag>
                                <span className="font-medium">{epic.name}</span>
                            </div>
                            {epic.summary && (
                                <div className="text-xs text-gray-500">{epic.summary}</div>
                            )}
                        </div>
                    </Select.Option>
                ))}
            </Select>

            {value && (
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium mb-1">Linked Jira Epic:</div>
                    <div className="flex items-center gap-2">
                        <Tag color="blue">{value.jiraEpicKey}</Tag>
                        <span>{value.jiraEpicName}</span>
                    </div>
                </div>
            )}
        </Space>
    );
};
