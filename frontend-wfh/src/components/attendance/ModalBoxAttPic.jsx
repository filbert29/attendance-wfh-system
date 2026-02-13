import { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Upload,
    Button,
    Image,
    Typography,
    Popconfirm,
} from 'antd';
import {
    UploadOutlined,
    DeleteOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export default function ModalBoxAttPic({
    open,
    mode,
    loading,
    data,
    onCancel,
    onSubmit,
    onDelete,
    readOnly = false,
}) {
    const [form] = Form.useForm();
    const isView = mode === 'view';

    useEffect(() => {
        if (isView && data) {
            form.setFieldsValue({
                task: data.task,
                description: data.description,
            });
        } else {
            form.resetFields();
        }
    }, [isView, data, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        onSubmit(values, form);
    };

    return (
        <Modal
            title={
                isView
                    ? 'Attendance Picture Detail'
                    : 'Add Attendance Picture'
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={!isView ? handleOk : undefined}
            okText={isView ? 'Close' : 'Save'}
            confirmLoading={loading}
            footer={
                isView
                    ? [
                        <Button
                            key="close"
                            onClick={onCancel}
                        >
                            Close
                        </Button>,

                        !readOnly && (
                            <Popconfirm
                                key="delete"
                                title="Delete this image?"
                                description="This action cannot be undone"
                                onConfirm={() => onDelete(data.seq_id)}
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={loading}
                                >
                                    Delete
                                </Button>
                            </Popconfirm>
                        ),
                    ].filter(Boolean)
                    : undefined
            }
        >
            <Form
                layout="vertical"
                form={form}
                disabled={isView}
            >
                <Form.Item
                    label="Task"
                    name="task"
                    rules={[
                        {
                            required: true,
                            message:
                                'Task is required',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                {isView ? (
                    <div>
                        <Text strong>Image</Text>
                        <br />
                        <Image
                            src={`${import.meta.env.VITE_ATTENDANCE_API_URL}/${data?.pic_dic}`}
                            style={{
                                marginTop: 8,
                                width: 200,
                            }}
                        />
                    </div>
                ) : (
                    <Form.Item
                        label="Upload Image"
                        name="image"
                        valuePropName="fileList"
                        getValueFromEvent={(e) =>
                            e?.fileList
                        }
                        rules={[
                            {
                                required: true,
                                message:
                                    'Image is required',
                            },
                        ]}
                    >
                        <Upload
                            maxCount={1}
                            beforeUpload={() => false}
                            listType="picture"
                        >
                            <Button
                                icon={<UploadOutlined />}
                            >
                                Choose Image
                            </Button>
                        </Upload>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
}
