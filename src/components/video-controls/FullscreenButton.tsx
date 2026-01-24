// SPDX-FileCopyrightText: Copyright 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { FC, useEffect, useState } from 'react';
import classes from './FullscreenButton.module.css';
import { ToggleButton } from './ToggleButton';

export interface FullscreenButtonProps {
    onChange?(fullscreen: boolean): void
}

export const FullscreenButton: FC<FullscreenButtonProps> = ({
    onChange,
}) => {
    const [isFullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        const checkFullscreen = () => {
            setFullscreen(!!document.fullscreenElement);
        };

        checkFullscreen();
        document.addEventListener('full', checkFullscreen);

        return () => {
            document.removeEventListener('fullscreenchange', checkFullscreen);
        };
    }, []);

    return <ToggleButton
        isActive={isFullscreen}
        activeContent={"⛶"}
        innerClassName={classes['fullscreen-inner']}
        inactiveContent={"⛶"}
        onChange={onChange}
    />;
};
