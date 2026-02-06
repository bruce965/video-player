// SPDX-FileCopyrightText: Copyright 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { trackFromFile } from '@components/video-drop/VideoDrop';
import { VideoPlayerTrack } from '@components/video-player';
import { FC, useCallback, useMemo, useRef } from 'react';
import { TrackGroup } from './TrackGroup';
import classes from './TrackSelector.module.css';

export interface TrackSelectorProps {
    tracks: VideoPlayerTrack[];
    selectedVideo?: VideoPlayerTrack | null;
    selectedAudio?: VideoPlayerTrack | null;
    selectedSubtitles?: VideoPlayerTrack | null;
    onVideoChange?(video: VideoPlayerTrack | null): void;
    onAudioChange?(audio: VideoPlayerTrack | null): void;
    onSubtitlesChange?(subtitles: VideoPlayerTrack | null): void;
    onTrackAdded?(track: VideoPlayerTrack): void;
}

export const TrackSelector: FC<TrackSelectorProps> = ({
    tracks,
    selectedVideo,
    selectedAudio,
    selectedSubtitles,
    onVideoChange,
    onAudioChange,
    onSubtitlesChange,
    onTrackAdded,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files)
            return;

        for (let i = 0; i < files.length; i++) {
            const track = await trackFromFile(files[i]);
            if (track)
                onTrackAdded?.(track);
        }

        // Reset input so the same file can be selected again
        e.target.value = '';
    }, [onTrackAdded]);

    const { videoTracks, audioTracks, subtitleTracks } = useMemo(() => ({
        videoTracks: tracks.filter(t => t.kind === 'video'),
        audioTracks: tracks.filter(t => t.kind === 'audio'),
        subtitleTracks: tracks.filter(t => t.kind === 'subtitles'),
    }), [tracks]);

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
            {onTrackAdded && <>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,audio/*,.vtt,.srt"
                    multiple
                    className={classes['file-input']}
                    onChange={handleFileChange}
                />
                <button
                    className={classes['open-button']}
                    onClick={handleOpenClick}
                >
                    Add files...
                </button>
            </>}
        </div>
    );
};
