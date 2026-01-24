// SPDX-FileCopyrightText: Copyright 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { Bar } from '@components/bar';
import { formatDuration } from '@utils/formatDuration';
import { FC } from 'react';
import classes from './SeekBar.module.css';

export interface SeekBarProps {
    time: number
    duration: number
    onChangeInteracting?(interacting: boolean): void
    onSeek?(time: number): void
}

export const SeekBar: FC<SeekBarProps> = ({
    time,
    duration,
    onChangeInteracting,
    onSeek,
}) => {
    const position = time / duration;

    return (
        <Bar
            value={position}
            className={classes['seekbar']}
            renderHint={pos => formatDuration(pos * duration)}
            onChangeInteracting={onChangeInteracting}
            onValueChange={onSeek}
        />
    );
};
