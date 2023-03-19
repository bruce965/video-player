import { CSSProperties, FC, MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDuration } from '../../utility/formatDuration';
import * as classes from './style.module.scss';

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
    const seekbar = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    useEffect(() => {
        onChangeInteracting?.(dragging);
    }, [onChangeInteracting, dragging]);

    const handleMouseDown = useCallback<MouseEventHandler>(e => {
        const handleMove = (e: MouseEvent) => {
            const rect = seekbar.current!.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            setHintPosition(pos); // while dragging, also set hint position
            onSeek?.(pos);
        };

        const handleUp = (e: MouseEvent) => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            setDragging(false);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);

        setDragging(true);
        handleMove(e.nativeEvent);
    }, [onSeek]);

    const position = time / duration;
    const playedStyle = useMemo<CSSProperties>(() => ({
        width: `${position * 100}%`,
    }), [position]);

    const [hintPosition, setHintPosition] = useState(0);
    const [hintVisible, setHintVisible] = useState(false);

    const handleMouseUpdate = useCallback<MouseEventHandler>(e => {
        const rect = seekbar.current!.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        setHintPosition(pos);
        setHintVisible(true);
    }, []);

    const hintStyle = useMemo<CSSProperties>(() => ({
        left: `${hintPosition * 100}%`,
    }), [hintPosition]);

    return <div
        ref={seekbar}
        className={classes['seekbar']}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseUpdate}
        onMouseUp={handleMouseUpdate}
        onMouseLeave={() => {
            setHintPosition(hintPosition);
            setHintVisible(false);
        }}
    >
        <div
            className={classes['hint'] + ((dragging || hintVisible) ? '' : (' ' + classes['hint-hide']))}
            style={hintStyle}
        >{formatDuration(hintPosition * duration)}</div>
        <div className={classes['played']} style={playedStyle}>
            <div className={classes['handle']} />
        </div>
    </div>
};
