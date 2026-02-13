import { useEffect, useState } from 'react';
import { attendanceApi } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { Col, Row, Typography } from 'antd';
import RecordTimeComponent from '../components/attendance/RecordTimeComponent';
import AttendancePictureComponent from '../components/attendance/AttendancePictureComponent';

const { Title, Text } = Typography;

export default function Home() {
    const [employee, setEmployee] = useState(null);
    const [attendanceId, setAttendanceId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const loadEmployee = async () => {
            try {
                const res = await attendanceApi.get('/employees/me');
                setEmployee(res.data);
            } catch {
                localStorage.clear();
                navigate('/');
            }
        };

        loadEmployee();
    }, [navigate]);

    return (
        <div
            style={{
                padding: '42px 4px 0px 4px',
            }}
            className="home-container"
        >
            <Title level={3}>Home</Title>

            <Text type="secondary">
                Halo, <b>{employee?.name}</b>
            </Text>

            <Row
                gutter={[24, 24]}
                style={{ marginTop: 24 }}
                align="stretch"
            >
                <Col
                    xs={24}
                    lg={8}
                >
                    <RecordTimeComponent onAttendanceLoaded={setAttendanceId} />
                </Col>

                {attendanceId && (
                    <Col
                        xs={24}
                        lg={16}
                    >
                        <AttendancePictureComponent
                            attendanceId={attendanceId}
                        />
                    </Col>
                )}
            </Row>

        </div>
    );
}
