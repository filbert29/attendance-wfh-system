import { Layout, Menu, Drawer, Button } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuOutlined,
    ScheduleOutlined,
    FileTextOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { getCurrentUser } from '../utils/auth';

const { Sider } = Layout;

const user = getCurrentUser();

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const onMenuClick = ({ key }) => {
        if (key === 'logout') {
            localStorage.clear();

            window.location.replace('/');
        } else {
            navigate(key);
        }

        setOpen(false);
    };

    const menuItems = [
        { key: '/home', icon: <HomeOutlined />, label: 'Home' },
        user === 'admin' && {
            key: '/employee',
            icon: <TeamOutlined />,
            label: 'Employee',
        },
        { key: '/attendance-list', icon: <ScheduleOutlined />, label: 'Attendance List' },
        { key: '/attendance-request-list', icon: <FileTextOutlined />, label: 'Attendance Request List' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
    ];

    return (
        <>
            <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setOpen(true)}
                style={{
                    fontSize: 20,
                    position: 'fixed',
                    top: '1.5rem',
                    left: '1.5rem',
                    zIndex: 1001,
                    opacity: open ? 0 : 1,
                    pointerEvents: open ? 'none' : 'auto',
                    transition: 'opacity 0.2s',
                }}
                className="mobile-menu-btn"
            />

            <Sider
                collapsible
                breakpoint="lg"
                collapsedWidth="0"
                trigger={null}
                onBreakpoint={(broken) => {
                    document.body.classList.toggle('mobile', broken);
                }}
            >
                <div
                    style={{
                        height: 48,
                        margin: 16,
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    WFH Attendance
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={onMenuClick}
                    items={menuItems}
                />
            </Sider>

            <Drawer
                title="WFH Attendance"
                placement="left"
                onClose={() => setOpen(false)}
                open={open}
            >
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={onMenuClick}
                    items={menuItems}
                />
            </Drawer>
        </>
    );
}
