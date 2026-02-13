import { useEffect, useState } from 'react';
import {
    Card,
    Table,
    Button,
    message,
    Grid,
    Typography,
    Space,
    Select,
} from 'antd';
import { attendanceApi } from '../api/api';
import EmployeeModal from '../components/employee/AddEmployeeModal';
import { AxiosError } from 'axios';
import { getCurrentUser } from '../utils/auth';
import TableListing from '../components/TableListing';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const user = getCurrentUser();

export default function Employee() {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [selectedEmpId, setSelectedEmpId] = useState();
    const [employeesFilter, setEmployeesFilter] = useState([]);

    const [resetPagination, setResetPagination] = useState(false);

    const loadEmployee = async () => {
        try {
            setLoading(true);

            const params = {};

            if (selectedEmpId) {
                params.emp_id = selectedEmpId;
            }

            setLoading(true);
            const res = await attendanceApi.get('/employees', {
                params,
            });
            setData(res.data);
        } catch {
            message.error('Failed load employee');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployee();
        loadEmployeesFilter();
    }, []);

    useEffect(() => {
        loadEmployee();
    }, [selectedEmpId]);

    const loadEmployeesFilter = async () => {
        try {
            const res = await attendanceApi.get('/employees');
            setEmployeesFilter(res.data);
        } catch {
            message.error('Failed load employees');
        }
    };

    const submit = async (values) => {
        try {
            setLoading(true);

            if (selected?.emp_id) {
                await attendanceApi.put(
                    `/employees/${selected.emp_id}`,
                    values,
                );
                message.success('Employee updated');
            } else {
                await attendanceApi.post('/employees', values);
                message.success('Employee created');
            }

            setOpen(false);
            setSelected(null);
            loadEmployee();
        } catch (err) {
            let errorMsg = 'Action failed';

            if (err instanceof AxiosError) {
                errorMsg =
                    err.response?.data?.message ??
                    err.response?.data?.error ??
                    errorMsg;
            }

            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (empId) => {
        try {
            setLoading(true);

            const res = await attendanceApi.get(
                `/employees/${empId}/attendance-count`,
            );

            const count = res.data.count;

            if (count === 0) {
                await attendanceApi.delete(`/employees/${empId}`);
                message.success('Employee deleted');
                setOpen(false);
                setSelected(null);
                loadEmployee();
            } else {
                setSelected((prev) => ({
                    ...prev,
                    attendanceCount: count,
                    needForceDelete: true,
                }));
            }
        } catch (err) {
            message.error(
                err?.response?.data?.message || 'Delete failed',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForceDelete = async (empId) => {
        try {
            setLoading(true);

            await attendanceApi.delete(`/employees/${empId}`);
            message.success('Employee deleted');
            setOpen(false);
            setSelected(null);
            loadEmployee();
        } catch (err) {
            message.error(
                err?.response?.data?.message || 'Delete failed',
            );
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            width: 150,
        },
        {
            title: 'Position',
            dataIndex: 'position_name',
            width: 150,
        },
        {
            title: 'Email',
            render: (_, r) => r.user?.email,
            width: 200,
        },
        {
            title: 'Type',
            render: (_, r) => r.user?.type,
            width: 120,
        },
        {
            title: 'Action',
            width: 100,
            render: (_, r) => (
                <Button
                    type="link"
                    size={isMobile ? 'small' : 'middle'}
                    onClick={() => {
                        setSelected({
                            emp_id: r.emp_id,
                            name: r.name,
                            position: r.position_name,
                            email: r.user.email,
                            user_type: r.user.type,
                        });
                        setOpen(true);
                    }}
                >
                    Edit
                </Button>
            ),
        },
    ]

    return (
        <div
            style={{
                padding: '42px 4px 0px 4px',
            }}
            className="attendance-list-container"
        >
            <Title level={3}>Employee</Title>

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
                                    options={employeesFilter.map((emp) => ({
                                        value: emp.emp_id,
                                        label: emp.name,
                                    }))}
                                />
                            </Space>
                        )}
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
                            onClick={() => {
                                setSelected(null);
                                setOpen(true);
                            }}
                        >
                            Add Employee
                        </Button>
                    </div>
                </div>
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

            <EmployeeModal
                open={open}
                data={selected}
                loading={loading}
                onCancel={() => {
                    setOpen(false);
                    setSelected(null);
                }}
                onSubmit={submit}
                onDelete={handleDelete}
                onForceDelete={handleForceDelete}
            />
        </div>
    );
}
