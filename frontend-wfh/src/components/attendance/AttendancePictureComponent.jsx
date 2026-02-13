/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
    Card,
    Button,
    Space,
    Image,
    Typography,
    message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { attendanceApi } from '../../api/api';
import { AxiosError } from 'axios';
import ModalBoxAttPic from './ModalBoxAttPic';
import ImageCard from './ImageCard';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

const { Text } = Typography;

export default function AttendancePictureComponent({
    attendanceId,
    readOnly = false,
}) {
    const [open, setOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [pictures, setPictures] = useState([]);
    const [selectedPic, setSelectedPic] = useState(null);
    const [loading, setLoading] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const maxHeight = isMobile
        ? (readOnly ? 800 : 300)
        : (readOnly ? 500 : 300);


    const loadPictures = async () => {
        if (!attendanceId) return;

        const res = await attendanceApi.get(
            `/attendance/picture/${attendanceId}`,
        );
        setPictures(res.data);
    };

    useEffect(() => {
        loadPictures();
    }, [attendanceId]);

    const openAddModal = () => {
        setSelectedPic(null);
        setModalMode('add');
        setOpen(true);
    };

    const openViewModal = async (seq_id) => {
        try {
            setLoading(true);
            const res = await attendanceApi.get(
                `/attendance/picture/detail/${seq_id}`,
            );
            setSelectedPic(res.data);
            setModalMode('view');
            setOpen(true);
        } catch {
            message.error('Gagal mengambil detail gambar');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values, form) => {
        try {
            const fileObj = values.image?.[0]?.originFileObj;

            if (!fileObj) {
                message.error('File tidak valid');
                return;
            }

            setLoading(true);

            const fd = new FormData();
            fd.append('file', fileObj);
            fd.append('att_id', attendanceId);
            fd.append('task', values.task);
            fd.append('description', values.description || '');

            await attendanceApi.post(
                '/attendance/picture',
                fd,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            message.success('Attendance picture disimpan');
            setOpen(false);
            form.resetFields();
            loadPictures();
        } catch (err) {
            let errorMsg = 'Gagal simpan attendance picture';

            if (err?.response?.data?.message) {
                if (Array.isArray(err.response.data.message)) {
                    errorMsg = err.response.data.message.join(', ');
                } else {
                    errorMsg = err.response.data.message;
                }
            }

            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (seq_id) => {
        try {
            setLoading(true);

            await attendanceApi.delete(
                `/attendance/picture/${seq_id}`,
            );

            message.success('Image deleted');
            setOpen(false);
            setSelectedPic(null);
            loadPictures();
        } catch {
            message.error(
                'Failed to delete image',
            );
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (value) =>
        value
            ? new Date(value).toLocaleTimeString('id-ID')
            : '--:--';

    return (
        <>
            <Card
                title="Attendance Picture"
                extra={
                    !readOnly && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openAddModal}
                        />
                    )
                }
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        overflowY: 'auto',
                        maxHeight: maxHeight,
                    }}
                >
                    <Space wrap style={{ gap: 25 }}>
                        {pictures.map((pic) => (
                            <ImageCard
                                key={pic.seq_id}
                                pic={pic}
                                onClick={openViewModal}
                                formatTime={formatTime}
                            />
                        ))}
                    </Space>
                </div>
            </Card>

            <ModalBoxAttPic
                open={open}
                mode={modalMode}
                loading={loading}
                data={selectedPic}
                onCancel={() => {
                    setOpen(false);
                    setSelectedPic(null);
                }}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                readOnly={readOnly}
            />
        </>
    );
}
