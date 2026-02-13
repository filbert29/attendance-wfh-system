/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    Button,
    Grid,
    Popconfirm,
    Typography,
} from 'antd';

const { useBreakpoint } = Grid;

const { Text } = Typography;

export default function AddEmployeeModal({
    open,
    onCancel,
    onSubmit,
    loading,
    data,
    onDelete,
    onForceDelete,
}) {
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const isEdit = !!data?.emp_id;

    useEffect(() => {
        if (open) {
            if (data) {
                form.setFieldsValue({
                    name: data.name,
                    position: data.position,
                    email: data.email,
                    user_type: data.user_type,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, data]);

    return (
        <>
            <Modal
                open={open}
                width={isMobile ? '100%' : 520}
                title={isEdit ? 'Edit Employee' : 'Add Employee'}
                onCancel={() => {
                    form.resetFields();
                    onCancel();
                }}
                confirmLoading={loading}
                footer={[
                    <Button key="cancel" onClick={onCancel}>
                        Cancel
                    </Button>,

                    isEdit && data?.user_type !== 'admin' && (
                        <Popconfirm
                            key="delete"
                            title="Delete this employee?"
                            description="This action cannot be undone"
                            onConfirm={() => onDelete(data.emp_id)}
                        >
                            <Button danger loading={loading}>
                                Delete
                            </Button>
                        </Popconfirm>
                    ),

                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={() => form.submit()}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>,
                ].filter(Boolean)}
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="position"
                        label="Position"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true },
                            { type: 'email' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    {!isEdit && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, min: 6 },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="user_type"
                        label="User Type"
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={[
                                { value: 'admin', label: 'Admin' },
                                { value: 'pasif', label: 'Pasif' },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={!!data?.needForceDelete}
                title="Warning"
                onCancel={onCancel}
                onOk={() =>
                    onForceDelete(data.emp_id)
                }
                okButtonProps={{ danger: true, loading }}
            >
                <Text>
                    Employee ini memiliki{' '}
                    <b>{data?.attendanceCount}</b>{' '}
                    record attendance.
                </Text>
                <Text>Apakah kamu yakin ingin menghapusnya?</Text>
            </Modal>
        </>
    );
}
