import { useEffect, useState } from "react";
import { attendanceApi } from "../../api/api";
import { Button, Card, message, Space, Tag, Tooltip, Typography } from "antd";

const { Title, Text } = Typography;

const RecordTimeComponent = ({ onAttendanceLoaded }) => {
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [loading, setLoading] = useState(false);
    const [now, setNow] = useState(new Date());
    const [attStatus, setAttStatus] = useState(null);

    const loadTodayAttendance = async () => {
        try {
            const res = await attendanceApi.get('/attendance/today');
            setStart(res.data.actual_start);
            setEnd(res.data.actual_end);
            setAttStatus(res.data.att_status);

            onAttendanceLoaded?.(res.data.att_id);
        } catch {
            message.error('Gagal mengambil data attendance hari ini');
        }
    };


    const handleRecord = async () => {
        setLoading(true);
        try {
            const res = await attendanceApi.post('/attendance/record');
            message.success(res.data.message);
            await loadTodayAttendance();
        } catch (err) {
            message.error(
                err?.response?.data?.message || 'Gagal record attendance',
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const todayLabel = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const timeLabel = now.toLocaleTimeString('id-ID');

    const statusMap = {
        PRS: 'Present',
        LTI: 'Late In',
        EAO: 'Early Out',
    };

    useEffect(() => {
        loadTodayAttendance();
    }, []);

    const formatTime = (value) =>
        value ? new Date(value).toLocaleTimeString('id-ID') : '--:--';

    return (
        <div>
            <Card
                style={{
                    maxWidth: 420,
                    marginTop: 0,
                    height: '100%',
                }}>
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Attendance Today
                    </Title>

                    <Space
                        orientation="vertical"
                        style={{ width: '100%' }}
                    >
                        <Text type="secondary">{todayLabel}</Text>
                        <Text strong style={{ fontSize: 18 }}>
                            {timeLabel}
                        </Text>
                    </Space>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 40,
                            width: '100%',
                        }}
                    >
                        <div>
                            <Space orientation="vertical" size="large">
                                <Space orientation="vertical">
                                    <Text>🟢 Record In</Text>
                                    <Title level={3} style={{ margin: 0 }}>
                                        {formatTime(start)}
                                    </Title>
                                </Space>

                                <Space orientation="vertical">
                                    <Text>🔴 Record Out</Text>
                                    <Title level={3} style={{ margin: 0 }}>
                                        {formatTime(end)}
                                    </Title>
                                </Space>
                            </Space>
                        </div>

                        <div
                            style={{
                                minWidth: 200,
                            }}
                        >
                            <Title level={5} style={{ marginBottom: 12 }}>
                                Attendance Status
                            </Title>

                            {!attStatus && (
                                <Text type="secondary">
                                    Belum ada status
                                </Text>
                            )}

                            {attStatus && (
                                <Space orientation="vertical" size="small">
                                    {attStatus.split(',').map((code) => (
                                        <Text key={code}>
                                            - {statusMap[code] || code}
                                        </Text>
                                    ))}
                                </Space>
                            )}
                        </div>
                    </div>


                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={loading}
                        onClick={handleRecord}
                    >
                        Record
                    </Button>
                </Space>
            </Card>
        </div>
    )
}

export default RecordTimeComponent
