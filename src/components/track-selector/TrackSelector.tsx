// SPDX-FileCopyrightText: Copyright 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { VideoPlayerContent } from '@components/video-player';
import { FC } from 'react';
import { TrackGroup } from './TrackGroup';
import classes from './TrackSelector.module.css';

export interface TrackSelectorProps {
    videoTracks: VideoPlayerContent[];
    audioTracks: VideoPlayerContent[];
    subtitleTracks: VideoPlayerContent[];
    selectedVideo?: VideoPlayerContent | null;
    selectedAudio?: VideoPlayerContent | null;
    selectedSubtitles?: VideoPlayerContent | null;
    onVideoChange?(video: VideoPlayerContent | null): void;
    onAudioChange?(audio: VideoPlayerContent | null): void;
    onSubtitlesChange?(subtitles: VideoPlayerContent | null): void;
}

export const TrackSelector: FC<TrackSelectorProps> = ({
    videoTracks,
    audioTracks,
    subtitleTracks,
    selectedVideo,
    selectedAudio,
    selectedSubtitles,
    onVideoChange,
    onAudioChange,
    onSubtitlesChange,
}) => {
    return (
        <div className={classes['track-selector']}>
            <TrackGroup
                title="Video tracks"
                tracks={videoTracks}
                selectedTrack={selectedVideo}
                onTrackChange={onVideoChange}
            />
            <TrackGroup
                title="Audio tracks"
                tracks={audioTracks}
                selectedTrack={selectedAudio}
                onTrackChange={onAudioChange}
            />
            <TrackGroup
                title="Subtitle tracks"
                tracks={subtitleTracks}
                selectedTrack={selectedSubtitles}
                onTrackChange={onSubtitlesChange}
            />
        </div>
    );
};
