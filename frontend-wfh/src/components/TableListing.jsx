/* eslint-disable react-hooks/set-state-in-effect */
import { Table, Grid } from 'antd';
import { useEffect, useState } from 'react';

const { useBreakpoint } = Grid;

export default function TableListing({
    rowKey,
    columns,
    dataSource,
    loading = false,
    resetPagination = false,
}) {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    useEffect(() => {
        setPagination({
            current: 1,
            pageSize: 10,
        });
    }, [resetPagination]);

    return (
        <Table
            sticky
            rowKey={rowKey}
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            size={isMobile ? 'small' : 'middle'}
            scroll={{
                x: isMobile ? 600 : undefined,
                y: 54 * 8,
            }}
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                showSizeChanger: !isMobile,
                pageSizeOptions: ['10', '20', '50'],
                onChange: (page, pageSize) => {
                    setPagination({
                        current: page,
                        pageSize,
                    });
                },
            }}
        />
    );
}
