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
    Drawer,
    Grid,
    Tooltip,
    Tag,
} from 'antd';
import dayjs from 'dayjs';
import { attendanceApi } from '../api/api';
import AttendancePictureComponent from '../components/attendance/AttendancePictureComponent';
import { getCurrentUser } from '../utils/auth';
import TableListing from '../components/TableListing';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const user = getCurrentUser();

export default function AttendanceList() {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [employees, setEmployees] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resetPagination, setResetPagination] = useState(false);

    const [dateRange, setDateRange] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState();

    const loadAttendance = async () => {
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

            if (selectedStatus) {
                params.status = selectedStatus;
            }

            const res = await attendanceApi.get('/attendance/list', {
                params,
            });

            setData(res.data);
        } catch {
            message.error('Gagal mengambil data attendance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, [selectedEmpId, dateRange, selectedStatus]);

    useEffect(() => {
        if (user === 'admin') {
            loadEmployees();
        }
    }, []);

    const loadEmployees = async () => {
        try {
            const res = await attendanceApi.get('/employees');
            setEmployees(res.data);
        } catch {
            message.error('Failed load employees');
        }
    };

    const columns = [
        {
            title: 'Employee',
            render: (_, record) =>
                record.employee_name ?? '-',
        },
        {
            title: 'Tanggal',
            dataIndex: 'created_date',
            render: (value) =>
                dayjs(value).format('DD MMM YYYY'),
        },
        {
            title: 'Check In',
            align: 'center',
            dataIndex: 'actual_start',
            render: (value) =>
                value
                    ? dayjs(value).format('HH:mm')
                    : '-',
        },
        {
            title: 'Check Out',
            align: 'center',
            dataIndex: 'actual_end',
            render: (value) =>
                value
                    ? dayjs(value).format('HH:mm')
                    : '-',
        },
        {
            title: 'Status',
            align: 'center',
            render: (_, record) => {
                if (!record.att_status) return '-';

                const statusMap = {
                    PRS: {
                        label: 'Present',
                        color: 'green',
                    },
                    LTI: {
                        label: 'Late In',
                        color: 'orange',
                    },
                    EAO: {
                        label: 'Early Out',
                        color: 'red',
                    },
                };

                const codes = record.att_status.split(',');

                return (
                    <Space>
                        {codes.map((code) => {
                            const status =
                                statusMap[code];

                            if (!status) return null;

                            return (
                                <Tooltip
                                    key={code}
                                    title={status.label}
                                >
                                    <Tag
                                        color={status.color}
                                        style={{
                                            cursor:
                                                'pointer',
                                        }}
                                    >
                                        {code}
                                    </Tag>
                                </Tooltip>
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: 'Detail',
            align: 'center',
            render: (_, record) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => {
                        setSelectedAttendance(record);
                        setDrawerOpen(true);
                    }}
                >
                    View
                </Button>
            ),
        },
    ].filter(Boolean);

    return (
        <div
            style={{
                padding: '42px 4px 0px 4px',
            }}
            className="attendance-list-container"
        >
            <>
                <Title level={3}>Attendance List</Title>

                <Card size="small" style={{ marginBottom: 16 }}>
                    <Space
                        orientation={
                            isMobile ? 'vertical' : 'horizontal'
                        }
                        size="large"
                        style={{ width: '100%' }}
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
                                style={{
                                    width: isMobile
                                        ? '100%'
                                        : 'auto',
                                }}
                                onChange={setDateRange}
                            />
                        </Space>

                        <Space
                            orientation="vertical"
                            style={{
                                width: isMobile ? '100%' : 200,
                                minWidth: 100,
                            }}
                        >
                            <Text>Select Status</Text>
                            <Select
                                allowClear
                                placeholder="All Status"
                                value={selectedStatus}
                                onChange={(value) => {
                                    setSelectedStatus(value);
                                    setResetPagination(!resetPagination);
                                }}
                                style={{ width: isMobile ? '100%' : 200, }}
                                options={[
                                    { value: 'PRS', label: 'Present' },
                                    { value: 'LTI', label: 'Late In' },
                                    { value: 'EAO', label: 'Early Out' },
                                ]}
                            />
                        </Space>

                    </Space>
                </Card>
                <Card>
                    <TableListing
                        rowKey="att_id"
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        resetPagination={resetPagination}
                    />
                </Card>
            </>

            <Drawer
                title="Attendance Detail"
                open={drawerOpen}
                size={isMobile ? '100%' : 720}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedAttendance(null);
                }}
            >
                {selectedAttendance && (
                    <AttendancePictureComponent
                        attendanceId={selectedAttendance.att_id}
                        readOnly
                    />
                )}
            </Drawer>
        </div>
    );
}
