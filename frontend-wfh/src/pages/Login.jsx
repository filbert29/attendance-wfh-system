import { useState } from 'react';
import { authApi } from '../api/api';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Alert,
} from 'antd';
import {
    EyeInvisibleOutlined,
    EyeTwoTone,
} from '@ant-design/icons';

import bgImage from '../images/login/image.png';
import wfhImage from '../images/login/wfh_image.png';

const { Title } = Typography;

export default function Login() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (values) => {
        setError('');
        setLoading(true);

        try {
            const res = await authApi.post('/auth/login', values);
            const { access_token, user } = res.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('type', user?.type);

            window.location.replace('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Email atau password salah');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="login-page"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            {/* TOP LEFT TEXT */}
            <div className="top-left-title">WFH Attendance</div>

            <Card className="login-card">
                <div className="login-content">
                    {/* LEFT */}
                    <div className="login-left">
                        <img src={wfhImage} alt="WFH Illustration" />
                    </div>

                    {/* RIGHT */}
                    <div className="login-right">
                        <Title level={3}>Sign In</Title>

                        {error && (
                            <Alert
                                type="error"
                                message={error}
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        <Form
                            layout="vertical"
                            onFinish={handleLogin}
                        >
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Email wajib diisi' },
                                    { type: 'email', message: 'Email tidak valid' },
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Email"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    { required: true, message: 'Password wajib diisi' },
                                ]}
                            >
                                <Input.Password
                                    size="large"
                                    placeholder="Password"
                                    iconRender={(visible) =>
                                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                    }
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                className="login-button"
                            >
                                Login
                            </Button>
                        </Form>
                    </div>
                </div>
            </Card>
        </div>
    );
}
