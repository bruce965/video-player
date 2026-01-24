// SPDX-FileCopyrightText: Copyright 2023-2024, 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { FC, Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { formatDuration } from '../../utility/formatDuration';
import { SeekBar } from '../seek-bar';
import { Content } from '../video-player';
import { VolumeBar } from '../volume-bar';
import classes from './style.module.css';

export interface VideoControlsProps {
    show: boolean
    videoTracks: Content[]
    audioTracks: Content[]
    subtitleTracks: Content[]
    isPlaying: boolean
    currentTime: number
    totalTime: number
    volume: number
    onChangeInteracting?(interacting: boolean): void
    onPlay?(): void
    onPause?(): void
    onSeek?(time: number): void
    onVolumeChange?(volume: number): void
    onFullscreenChange?(fullscreen: boolean): void
}

export const VideoControls: FC<VideoControlsProps> = ({
    show,
    videoTracks,
    audioTracks,
    subtitleTracks,
    isPlaying,
    currentTime,
    totalTime,
    volume,
    onChangeInteracting,
    onPlay,
    onPause,
    onSeek,
    onVolumeChange,
    onFullscreenChange,
}) => {
    const seekHandler = useCallback((position: number) => {
        onSeek?.(position * totalTime);
    }, [totalTime, onSeek]);

    const playPauseHandler = useCallback((play: boolean) => {
        (play ? onPlay : onPause)?.();
    }, [onPause, onPlay]);

    return <div
        className={classes['controls'] + (show ? '' : (' ' + classes['controls-hidden']))}
    >
        {/* TODO: remove. */}
        <div style={{ whiteSpace: 'pre-wrap', padding: '1em', position: 'absolute', bottom: '100%' }}>
            Video tracks: {videoTracks.map(v => <Fragment key={v.url}><br/><a href={v.url} target="_blank">{v.name}</a> {v.type}</Fragment>)}{videoTracks.length ? "" : <><br/>none</>}<br/><br/>
            Audio tracks: {audioTracks.map(a => <Fragment key={a.url}><br/><a href={a.url} target="_blank">{a.name}</a> {a.type}</Fragment>)}{audioTracks.length ? "" : <><br/>none</>}<br/><br/>
            Subtitle tracks: {subtitleTracks.map(s => <Fragment key={s.url}><br/><a href={s.url} target="_blank">{s.name}</a> {s.type}</Fragment>)}{subtitleTracks.length ? "" : <><br/>none</>}
        </div>

        <div className={classes['left']}>
            <ToggleButton
                isActive={isPlaying}
                className={classes['play']}
                innerClassName={classes['play-inner']}
                activeContent={"⏸"}
                inactiveContent={"⏵"}
                onChange={playPauseHandler}
            />

            <div className={classes['time']}>
                <span>{formatDuration(currentTime)}</span> / <span>{formatDuration(totalTime)}</span>
            </div>

            <VolumeBar
                volume={volume}
                onChangeInteracting={onChangeInteracting}
                onVolumeChange={onVolumeChange}
            />
        </div>

        <SeekBar
            time={currentTime}
            duration={totalTime}
            onChangeInteracting={onChangeInteracting}
            onSeek={seekHandler}
        />

        <div className={classes['right']}>
            <FullscreenButton onChange={onFullscreenChange} />
        </div>
    </div>;
};

interface ToggleButtonProps {
    isActive: boolean
    className?: string
    innerClassName?: string
    activeClassName?: string
    inactiveClassName?: string
    activeContent: ReactNode
    inactiveContent: ReactNode
    onChange?(active: boolean): void
}
const ToggleButton: FC<ToggleButtonProps> = ({
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

interface FullscreenButtonProps {
    onChange?(fullscreen: boolean): void
}

const FullscreenButton: FC<FullscreenButtonProps> = ({
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
