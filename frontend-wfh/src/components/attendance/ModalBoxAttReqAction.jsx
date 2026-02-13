import {
    Modal,
    Typography,
    Button,
    Input,
    Space,
    message,
} from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';
import { attendanceApi } from '../../api/api';

const { Text } = Typography;
const { TextArea } = Input;

export default function ModalBoxAttReqAction({
    open,
    onClose,
    record,
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    if (!record) return null;

    const handleApprove = async () => {
        try {
            setLoading(true);

            await attendanceApi.post(
                `/attendance/request/${record.req_id}/approve`
            );

            message.success(
                'Request berhasil diapprove'
            );

            onSuccess();
            onClose();
        } catch (err) {
            message.error(
                err.response?.data?.message ||
                'Gagal approve'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            message.error(
                'Reject reason wajib diisi'
            );
            return;
        }

        try {
            setLoading(true);

            await attendanceApi.post(
                `/attendance/request/${record.req_id}/reject`,
                {
                    reject_reason:
                        rejectReason,
                }
            );

            message.success(
                'Request berhasil direject'
            );

            onSuccess();
            onClose();
        } catch (err) {
            message.error(
                err.response?.data?.message ||
                'Gagal reject'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Review Attendance Request"
            open={open}
            onCancel={() => {
                setRejectMode(false);
                setRejectReason('');
                onClose();
            }}
            footer={null}
            destroyOnHidden
        >
            <Space
                direction="vertical"
                style={{ width: '100%' }}
            >
                <Text>
                    Employee:{' '}
                    <b>
                        {record.employee_name}
                    </b>
                </Text>

                <Text>
                    Tanggal:{' '}
                    {dayjs(
                        record.tanggal
                    ).format(
                        'DD MMM YYYY'
                    )}
                </Text>

                <Text>
                    Current Check In:{' '}
                    {record.actual_start
                        ? dayjs(
                            record.actual_start
                        ).format(
                            'HH:mm'
                        )
                        : '-'}
                </Text>

                <Text>
                    Current Check Out:{' '}
                    {record.actual_end
                        ? dayjs(
                            record.actual_end
                        ).format(
                            'HH:mm'
                        )
                        : '-'}
                </Text>

                <Text>
                    Request Check In:{' '}
                    {record.request_checkin
                        ? dayjs(
                            record.request_checkin
                        ).format(
                            'HH:mm'
                        )
                        : '-'}
                </Text>

                <Text>
                    Request Check Out:{' '}
                    {record.request_checkout
                        ? dayjs(
                            record.request_checkout
                        ).format(
                            'HH:mm'
                        )
                        : '-'}
                </Text>

                <Text>
                    Remark: {record.remark}
                </Text>

                {record.status ===
                    'Waiting Approval' && (
                        <>
                            {rejectMode && (
                                <TextArea
                                    rows={3}
                                    placeholder="Masukkan alasan reject"
                                    value={
                                        rejectReason
                                    }
                                    onChange={(e) =>
                                        setRejectReason(
                                            e.target
                                                .value
                                        )
                                    }
                                />
                            )}

                            <Space
                                style={{
                                    marginTop: 16,
                                }}
                            >
                                <Button
                                    type="primary"
                                    loading={
                                        loading
                                    }
                                    onClick={
                                        handleApprove
                                    }
                                >
                                    Approve
                                </Button>

                                {!rejectMode ? (
                                    <Button
                                        danger
                                        onClick={() =>
                                            setRejectMode(
                                                true
                                            )
                                        }
                                    >
                                        Reject
                                    </Button>
                                ) : (
                                    <Button
                                        danger
                                        loading={
                                            loading
                                        }
                                        onClick={
                                            handleReject
                                        }
                                    >
                                        Confirm Reject
                                    </Button>
                                )}
                            </Space>
                        </>
                    )}
            </Space>
        </Modal>
    );
}
