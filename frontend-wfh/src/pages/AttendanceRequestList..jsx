/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
    Card,
    DatePicker,
    Space,
    Typography,
    message,
    Select,
    Button,
    Grid,
    Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import { attendanceApi } from '../api/api';
import { getCurrentUser } from '../utils/auth';
import TableListing from '../components/TableListing';
import ModalBoxAttReq from '../components/attendance/ModalBoxAttReq';
import ModalBoxAttReqAction from '../components/attendance/ModalBoxAttReqAction';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const user = getCurrentUser();

export default function AttendanceRequestList() {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [employees, setEmployees] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState();
    const [dateRange, setDateRange] = useState(null);
    const [status, setStatus] = useState();

    const [modalOpen, setModalOpen] = useState(false);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resetPagination, setResetPagination] = useState(false);


    const [actionOpen, setActionOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);


    const loadEmployees = async () => {
        try {
            const res = await attendanceApi.get('/employees');
            setEmployees(res.data);
        } catch {
            message.error('Failed load employees');
        }
    };

    const loadRequests = async () => {
        try {
            setLoading(true);

            const params = {};

            if (selectedEmpId) {
                params.emp_id = selectedEmpId;
            }

            if (dateRange?.length === 2) {
                params.start_date =
                    dateRange[0].format('YYYY-MM-DD');
                params.end_date =
                    dateRange[1].format('YYYY-MM-DD');
            }

            if (status) {
                params.status = status;
            }

            const res = await attendanceApi.get(
                '/attendance/request/list',
                { params }
            );

            setData(res.data);
        } catch {
            message.error('Gagal mengambil data request');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [selectedEmpId, dateRange, status]);

    useEffect(() => {
        if (user === 'admin') {
            loadEmployees();
        }
    }, []);

    const columns = [
        {
            title: 'Employee',
            render: (_, record) =>
                record.employee_name ?? '-',
        },
        {
            title: 'Tanggal',
            render: (_, record) =>
                dayjs(record.tanggal).format(
                    'DD MMM YYYY'
                ),
        },
        {
            title: 'Check In',
            render: (_, record) =>
                record.actual_start
                    ? dayjs(record.actual_start).format(
                        'HH:mm'
                    )
                    : '-',
        },
        {
            title: 'Check Out',
            render: (_, record) =>
                record.actual_end
                    ? dayjs(record.actual_end).format(
                        'HH:mm'
                    )
                    : '-',
        },
        {
            title: 'Request Check In',
            render: (_, record) =>
                record.request_checkin
                    ? dayjs(
                        record.request_checkin
                    ).format('HH:mm')
                    : '-',
        },
        {
            title: 'Request Check Out',
            render: (_, record) =>
                record.request_checkout
                    ? dayjs(
                        record.request_checkout
                    ).format('HH:mm')
                    : '-',
        },
        {
            title: 'Remark',
            dataIndex: 'remark',
            ellipsis: true,
        },
        {
            title: 'Status',
            align: 'center',
            render: (_, record) => {
                if (
                    record.status === 'Rejected' &&
                    record.reject_reason
                ) {
                    return (
                        <Tooltip
                            title={record.reject_reason}
                        >
                            <span
                                style={{
                                    color: 'red',
                                    cursor: 'pointer',
                                }}
                            >
                                Rejected
                            </span>
                        </Tooltip>
                    );
                }

                return record.status;
            },
        },
        ...(user === 'admin'
            ? [
                {
                    title: 'Action',
                    align: 'center',
                    render: (_, record) => (
                        <Button
                            type="link"
                            disabled={
                                record.status !==
                                'Waiting Approval'
                            }
                            onClick={() => {
                                setSelectedRecord(
                                    record
                                );
                                setActionOpen(
                                    true
                                );
                            }}
                        >
                            Review
                        </Button>
                    ),
                },
            ]
            : []),

    ];

    return (
        <div
            style={{
                padding: '42px 4px 0px 4px',
            }}
        >
            <Title level={3}>
                Attendance Correction
            </Title>

            <Card size="small" style={{ marginBottom: 16 }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'stretch' : 'center',
                        gap: 16,
                    }}
                >
                    <Space
                        orientation={isMobile ? 'vertical' : 'horizontal'}
                        size="large"
                        style={{
                            width: isMobile ? '100%' : 'auto',
                        }}
                    >
                        {user === 'admin' && (
                            <Space
                                orientation="vertical"
                                style={{
                                    width: isMobile ? '100%' : 250,
                                }}
                            >
                                <Text>Select Employee</Text>

                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="All Employees"
                                    style={{ width: '100%' }}
                                    value={selectedEmpId}
                                    onChange={(value) => {
                                        setSelectedEmpId(value);
                                        setResetPagination(!resetPagination);
                                    }}
                                    options={employees.map((emp) => ({
                                        value: emp.emp_id,
                                        label: emp.name,
                                    }))}
                                />
                            </Space>
                        )}

                        <Space
                            orientation="vertical"
                            style={{
                                width: isMobile
                                    ? '100%'
                                    : 'auto',
                            }}
                        >
                            <Text>Select Date Range</Text>
                            <RangePicker
                                allowClear
                                format="DD-MM-YYYY"
                                onChange={setDateRange}
                            />
                        </Space>

                        <Space
                            orientation="vertical"
                            style={{
                                width: isMobile
                                    ? '100%'
                                    : 200,
                            }}
                        >
                            <Text>Status</Text>
                            <Select
                                allowClear
                                placeholder="All Status"
                                value={status}
                                style={{
                                    width: isMobile
                                        ? '100%'
                                        : 200,
                                }}
                                onChange={setStatus}
                                options={[
                                    {
                                        label:
                                            'Waiting Approval',
                                        value:
                                            'Waiting Approval',
                                    },
                                    {
                                        label: 'Approved',
                                        value: 'Approved',
                                    },
                                    {
                                        label: 'Rejected',
                                        value: 'Rejected',
                                    },
                                ]}
                            />
                        </Space>
                    </Space>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            width: isMobile ? '100%' : 'auto',
                        }}
                    >
                        <Button
                            type="primary"
                            onClick={() => setModalOpen(true)}
                        >
                            Add Request
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <TableListing
                    rowKey="req_id"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    resetPagination={
                        resetPagination
                    }
                />
            </Card>

            <ModalBoxAttReq
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={loadRequests}
            />

            <ModalBoxAttReqAction
                open={actionOpen}
                onClose={() =>
                    setActionOpen(false)
                }
                record={selectedRecord}
                onSuccess={loadRequests}
            />
        </div>
    );
}
