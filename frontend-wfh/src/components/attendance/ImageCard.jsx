import { Card, Image, Typography } from 'antd';

const { Text } = Typography;

export default function ImageCard({
    pic,
    onClick,
    formatTime,
}) {
    return (
        <Card
            hoverable
            className="card-att-img"
            onClick={() => onClick(pic.seq_id)}
            style={{
                width: 180,
                height: 240,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: 8,
                overflow: 'hidden',
            }}
            cover={
                <div
                    className="att-img"
                    style={{
                        width: '100%',
                        height: 160,
                        overflow: 'hidden',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Image
                        src={`${import.meta.env.VITE_ATTENDANCE_API_URL}/${pic.pic_dic}`}
                        preview
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    />
                </div>
            }
        >
            <Text style={{ width: '100%' }}>
                <b>{pic.task}</b>
                <br />
                {formatTime(pic.created_date)}
            </Text>
        </Card>
    );
}
