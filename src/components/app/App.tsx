// SPDX-FileCopyrightText: Copyright 2023, 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { VideoPlayer, VideoPlayerTrack } from '@components/video-player';
import { FC, useCallback, useEffect, useState } from 'react';

export const App: FC = () => {
    const [tracks, setTracks] = useState<VideoPlayerTrack[]>([]);

    const [selectedVideo, setVideo] = useState<VideoPlayerTrack | null>(tracks.filter(t => t.kind === 'video')[0] ?? null);
    const [selectedAudio, setAudio] = useState<VideoPlayerTrack | null>(tracks.filter(t => t.kind === 'audio')[0] ?? null);
    const [selectedSubtitles, setSubtitles] = useState<VideoPlayerTrack | null>(tracks.filter(t => t.kind === 'subtitles')[0] ?? null);

    // update document title with video name
    useEffect(() => {
        const title = document.title;

        if (selectedVideo != null)
            document.title = `${selectedVideo.name} - ${document.title}`;

        return () => {
            if (name != null)
                document.title = title;
        };
    }, [selectedVideo]);

    const handleTrackAdded = useCallback((track: VideoPlayerTrack) => {
        setTracks(current => [...current, track]);

        switch (track.kind) {
            case 'video':
                setVideo(current => current ?? track);
                break;

            case 'audio':
                setAudio(current => current ?? track);
                break;

            case 'subtitles':
                setSubtitles(current => current ?? track);
                break;
        }
    }, []);

    return (
        <VideoPlayer
            tracks={tracks}
            selectedVideo={selectedVideo}
            selectedAudio={selectedAudio}
            selectedSubtitles={selectedSubtitles}
            onVideoChange={setVideo}
            onAudioChange={setAudio}
            onSubtitlesChange={setSubtitles}
            onTrackAdded={handleTrackAdded}
        />
    );
};
