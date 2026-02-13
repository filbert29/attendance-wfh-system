import {
    Modal,
    Form,
    DatePicker,
    TimePicker,
    Button,
    Typography,
    message,
    Popconfirm,
    Input,
    Spin,
} from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { attendanceApi } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { TextArea } = Input;

export default function ModalBoxAttReq({
    open,
    onClose,
    onSuccess,
}) {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [loadingEmployee, setLoadingEmployee] = useState(false);
    const [adminList, setAdminList] = useState([]);

    const [selectedDate, setSelectedDate] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;

        const loadInitial = async () => {
            try {
                setLoadingEmployee(true);

                const [empRes, adminRes] =
                    await Promise.all([
                        attendanceApi.get('/employees/me'),
                        attendanceApi.get('/employees/admins'),
                    ]);

                setEmployee(empRes.data);
                setAdminList(adminRes.data);
            } catch {
                localStorage.clear();
                navigate('/');
            } finally {
                setLoadingEmployee(false);
            }
        };

        loadInitial();
    }, [open, navigate]);

    const loadAttendanceByDate = async (date) => {
        try {
            const res = await attendanceApi.get(
                '/attendance/list',
                {
                    params: {
                        start_date: date,
                        end_date: date,
                    },
                }
            );

            if (res.data.length === 0) {
                message.error(
                    'Attendance tidak ditemukan pada tanggal tersebut'
                );
                setTodayAttendance(null);
                form.setFieldsValue({
                    request_checkin: null,
                    request_checkout: null,
                });
                return;
            }

            setTodayAttendance(res.data[0]);

            // reset time field saat ganti tanggal
            form.setFieldsValue({
                request_checkin: null,
                request_checkout: null,
            });
        } catch {
            message.error('Gagal ambil attendance');
        }
    };

    const handleSubmit = async (values) => {
        if (!selectedDate) {
            message.error('Tanggal belum dipilih');
            return;
        }

        try {
            setSubmitting(true);

            await attendanceApi.post(
                '/attendance/request',
                {
                    date: selectedDate,
                    request_checkin:
                        values.request_checkin?.format('HH:mm'),
                    request_checkout:
                        values.request_checkout?.format('HH:mm'),
                    remark: values.remark,
                }
            );

            message.success(
                'Request berhasil dikirim'
            );

            form.resetFields();
            setTodayAttendance(null);
            setSelectedDate(null);
            onSuccess();
            onClose();
        } catch (err) {
            message.error(
                err.response?.data?.message ||
                'Gagal kirim request'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setTodayAttendance(null);
        setSelectedDate(null);
        onClose();
    };

    return (
        <Modal
            title="Add Attendance Correction"
            open={open}
            onCancel={handleClose}
            footer={null}
            destroyOnHidden
        >
            {loadingEmployee ? (
                <Spin />
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item label="Employee">
                        <Text strong>
                            {employee?.name || '-'}
                        </Text>
                    </Form.Item>

                    <Form.Item
                        label="Tanggal"
                        name="date"
                        rules={[
                            {
                                required: true,
                                message: 'Pilih tanggal',
                            },
                        ]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD-MM-YYYY"
                            onChange={(value) => {
                                if (!value) {
                                    setSelectedDate(null);
                                    setTodayAttendance(null);
                                    return;
                                }

                                const dateStr =
                                    value.format(
                                        'YYYY-MM-DD'
                                    );

                                setSelectedDate(dateStr);
                                loadAttendanceByDate(
                                    dateStr
                                );
                            }}
                        />
                    </Form.Item>

                    {todayAttendance && (
                        <>
                            <Text>
                                Current Check In:{' '}
                                {todayAttendance.actual_start
                                    ? dayjs(
                                        todayAttendance.actual_start
                                    ).format('HH:mm')
                                    : '-'}
                            </Text>
                            <br />
                            <Text>
                                Current Check Out:{' '}
                                {todayAttendance.actual_end
                                    ? dayjs(
                                        todayAttendance.actual_end
                                    ).format('HH:mm')
                                    : '-'}
                            </Text>

                            <Form.Item
                                label="Request Check In"
                                name="request_checkin"
                            >
                                <TimePicker
                                    format="HH:mm"
                                    style={{
                                        width: '100%',
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Request Check Out"
                                name="request_checkout"
                                dependencies={['request_checkin']}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const checkIn =
                                                getFieldValue('request_checkin');

                                            if (!value || !checkIn) {
                                                return Promise.resolve();
                                            }

                                            if (
                                                value.isBefore(checkIn)
                                            ) {
                                                return Promise.reject(
                                                    new Error(
                                                        'Check Out tidak boleh lebih kecil dari Check In'
                                                    )
                                                );
                                            }

                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Remark"
                                name="remark"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Remark wajib diisi',
                                    },
                                ]}
                            >
                                <TextArea
                                    rows={3}
                                    maxLength={255}
                                    showCount
                                />
                            </Form.Item>

                            <Popconfirm
                                title={
                                    <div>
                                        <div>
                                            Yakin kirim ke approver?
                                        </div>
                                        <div
                                            style={{
                                                marginTop: 8,
                                            }}
                                        >
                                            <Text strong>
                                                Approver:
                                            </Text>
                                            {adminList.length ===
                                                0 ? (
                                                <div>
                                                    Tidak ada admin
                                                </div>
                                            ) : (
                                                adminList.map(
                                                    (
                                                        admin
                                                    ) => (
                                                        <div
                                                            key={
                                                                admin.emp_id
                                                            }
                                                        >
                                                            -{' '}
                                                            {
                                                                admin.name
                                                            }
                                                        </div>
                                                    )
                                                )
                                            )}
                                        </div>
                                    </div>
                                }
                                onConfirm={() =>
                                    form.submit()
                                }
                            >
                                <Button
                                    type="primary"
                                    loading={submitting}
                                    block
                                >
                                    Send to Approver
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Form>
            )}
        </Modal>
    );
}
