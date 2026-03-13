import * as React from 'react';
import { useCallback } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function BasicMenu({ onChange }: { onChange: Function }) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSQLChange = useCallback((sql: string) => {
        onChange?.(sql);
        setAnchorEl(null);
    }, [setAnchorEl, onChange]);

    return (
        <>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                startIcon={<span style={{ margin: 10 }}>&equiv;</span>}
            >
                Choose SQL
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={() => handleSQLChange('mysql')}>MySQL</MenuItem>
                <MenuItem onClick={() => handleSQLChange('postgresql')}>PostgreSQL</MenuItem>
                <MenuItem onClick={() => handleSQLChange('sqlserver')}>SQLServer</MenuItem>
            </Menu>
        </>
    );
}