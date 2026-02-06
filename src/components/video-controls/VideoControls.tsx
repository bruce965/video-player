// SPDX-FileCopyrightText: Copyright 2023-2024, 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { SeekBar } from '@components/seek-bar';
import { TrackSelector } from '@components/track-selector';
import { VideoPlayerTrack } from '@components/video-player';
import { VolumeBar } from '@components/volume-bar/VolumeBar';
import { formatDuration } from '@utils/formatDuration';
import { FC, useCallback } from 'react';
import { FullscreenButton } from './FullscreenButton';
import { ToggleButton } from './ToggleButton';
import classes from './VideoControls.module.css';

export interface VideoControlsProps {
    show: boolean
    tracks: VideoPlayerTrack[]
    selectedVideo?: VideoPlayerTrack | null
    selectedAudio?: VideoPlayerTrack | null
    selectedSubtitles?: VideoPlayerTrack | null
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
    onVideoChange?(video: VideoPlayerTrack | null): void
    onAudioChange?(audio: VideoPlayerTrack | null): void
    onSubtitlesChange?(subtitles: VideoPlayerTrack | null): void
    onTrackAdded?(track: VideoPlayerTrack): void
}

export const VideoControls: FC<VideoControlsProps> = ({
    show,
    tracks,
    selectedVideo,
    selectedAudio,
    selectedSubtitles,
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
    onVideoChange,
    onAudioChange,
    onSubtitlesChange,
    onTrackAdded,
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
        <TrackSelector
            tracks={tracks}
            selectedVideo={selectedVideo}
            selectedAudio={selectedAudio}
            selectedSubtitles={selectedSubtitles}
            onVideoChange={onVideoChange}
            onAudioChange={onAudioChange}
            onSubtitlesChange={onSubtitlesChange}
            onTrackAdded={onTrackAdded}
        />

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
            videoSrc={selectedVideo?.url}
            onChangeInteracting={onChangeInteracting}
            onSeek={seekHandler}
        />

        <div className={classes['right']}>
            <FullscreenButton onChange={onFullscreenChange} />
        </div>
    </div>;
};
