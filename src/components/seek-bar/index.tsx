import { FC } from 'react';
import { formatDuration } from '../../utility/formatDuration';
import { Bar } from '../bar';
import classes from './style.module.css';

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
