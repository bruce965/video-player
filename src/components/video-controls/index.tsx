import { FC, Fragment, useCallback } from 'react';
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
}) => {
    const seekHandler = useCallback((position: number) => {
        onSeek?.(position * totalTime);
    }, [totalTime, onSeek]);

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
            <button
                className={classes['button'] + ' ' + classes['play']}
                onClick={isPlaying ? () => onPause?.() : () => onPlay?.()}
            >
                <div className={classes['play-inner']}>{isPlaying ? "⏸" : "⏵"}</div>
            </button>
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
    </div>;
};
