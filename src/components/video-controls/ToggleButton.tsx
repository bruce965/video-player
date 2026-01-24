// SPDX-FileCopyrightText: Copyright 2023-2024, 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { FC, ReactNode, useCallback } from 'react';
import classes from './ToggleButton.module.css';

export interface ToggleButtonProps {
    isActive: boolean
    className?: string
    innerClassName?: string
    activeClassName?: string
    inactiveClassName?: string
    activeContent: ReactNode
    inactiveContent: ReactNode
    onChange?(active: boolean): void
}

export const ToggleButton: FC<ToggleButtonProps> = ({
    isActive,
    className,
    innerClassName,
    activeClassName,
    inactiveClassName,
    activeContent,
    inactiveContent,
    onChange,
}) => {
    const clickHandler = useCallback(() => {
        onChange?.(!isActive);
    }, [isActive, onChange]);

    const extraClassName = isActive ? activeClassName : inactiveClassName;

    return <button
        className={classes['button'] + (className == null ? '' : (' ' + className)) + (extraClassName == null ? '' : (' ' + extraClassName))}
        onClick={clickHandler}
    >
        <div className={innerClassName}>
            {isActive ? activeContent : inactiveContent}
        </div>
    </button>;
}
