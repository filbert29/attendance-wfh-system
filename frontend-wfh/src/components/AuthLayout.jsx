import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const { Content } = Layout;

export default function AuthLayout() {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar />

            <Layout>
                <Content style={{ padding: 24 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
