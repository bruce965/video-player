// SPDX-FileCopyrightText: Copyright 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { Bar } from '@components/bar';
import { formatDuration } from '@utils/formatDuration';
import { FC, useCallback } from 'react';
import classes from './SeekBar.module.css';
import { Thumbnail } from './Thumbnail';

export interface SeekBarProps {
    time: number
    duration: number
    videoSrc?: string
    onChangeInteracting?(interacting: boolean): void
    onSeek?(time: number): void
}

export const SeekBar: FC<SeekBarProps> = ({
    time,
    duration,
    videoSrc,
    onChangeInteracting,
    onSeek,
}) => {
    const position = time / duration;

    const renderHint = useCallback((pos: number) => (
        <div className={classes['hint-content']}>
            <Thumbnail videoSrc={videoSrc} time={pos * duration} />
            <span className={classes['hint-time']}>{formatDuration(pos * duration)}</span>
        </div>
    ), [videoSrc, duration]);

    return (
        <Bar
            value={position}
            className={classes['seekbar']}
            renderHint={renderHint}
            onChangeInteracting={onChangeInteracting}
            onValueChange={onSeek}
        />
    );
};
