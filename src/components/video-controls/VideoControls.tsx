// SPDX-FileCopyrightText: Copyright 2023-2024, 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { SeekBar } from '@components/seek-bar';
import { TrackSelector } from '@components/track-selector';
import { VideoPlayerContent } from '@components/video-player';
import { VolumeBar } from '@components/volume-bar/VolumeBar';
import { formatDuration } from '@utils/formatDuration';
import { FC, useCallback } from 'react';
import { FullscreenButton } from './FullscreenButton';
import { ToggleButton } from './ToggleButton';
import classes from './VideoControls.module.css';

export interface VideoControlsProps {
    show: boolean
    videoTracks: VideoPlayerContent[]
    audioTracks: VideoPlayerContent[]
    subtitleTracks: VideoPlayerContent[]
    selectedVideo?: VideoPlayerContent | null
    selectedAudio?: VideoPlayerContent | null
    selectedSubtitles?: VideoPlayerContent | null
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
    onVideoChange?(video: VideoPlayerContent | null): void
    onAudioChange?(audio: VideoPlayerContent | null): void
    onSubtitlesChange?(subtitles: VideoPlayerContent | null): void
    onVideoAdded?(video: VideoPlayerContent): void
    onAudioAdded?(audio: VideoPlayerContent): void
    onSubtitlesAdded?(subtitles: VideoPlayerContent): void
}

export const VideoControls: FC<VideoControlsProps> = ({
    show,
    videoTracks,
    audioTracks,
    subtitleTracks,
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
    onVideoAdded,
    onAudioAdded,
    onSubtitlesAdded,
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
            videoTracks={videoTracks}
            audioTracks={audioTracks}
            subtitleTracks={subtitleTracks}
            selectedVideo={selectedVideo}
            selectedAudio={selectedAudio}
            selectedSubtitles={selectedSubtitles}
            onVideoChange={onVideoChange}
            onAudioChange={onAudioChange}
            onSubtitlesChange={onSubtitlesChange}
            onVideoAdded={onVideoAdded}
            onAudioAdded={onAudioAdded}
            onSubtitlesAdded={onSubtitlesAdded}
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
