import { CSSProperties, FC, MouseEventHandler, useCallback, useMemo, useRef } from 'react';
import * as classes from './style.module.scss';

export interface SeekBarProps {
    time: number
    duration: number
    onSeek?(time: number): void
}

export const SeekBar: FC<SeekBarProps> = ({
    time,
    duration,
    onSeek,
}) => {
    const seekbar = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback<MouseEventHandler<HTMLElement>>(e => {
        const handleMove = (e: MouseEvent) => {
            const rect = seekbar.current!.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            onSeek?.(pos);
        };

        const handleUp = (e: MouseEvent) => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);

            handleMove(e);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        handleMove(e.nativeEvent);
    }, [onSeek]);

    const position = time / duration;
    const playedStyle = useMemo<CSSProperties>(() => ({
        width: `${position * 100}%`,
    }), [position]);

    return <div ref={seekbar} className={classes['seekbar']} onMouseDown={handleMouseDown}>
        <div className={classes['played']} style={playedStyle}>
            <div className={classes['handle']} />
        </div>
    </div>
};
