// SPDX-FileCopyrightText: Copyright 2023, 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { VideoControls } from '@components/video-controls';
import { VideoDrop } from '@components/video-drop';
import { useRefMemo } from '@hooks/useRefMemo';
import { useTimer } from '@hooks/useTimer';
import { FC, MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import classes from './VideoPlayer.module.css';

export interface VideoPlayerContent {
    url: string;
    name: string;
    type: string;
}

export interface VideoPlayerProps {
    videoTracks?: VideoPlayerContent[]
    audioTracks?: VideoPlayerContent[]
    subtitleTracks?: VideoPlayerContent[]
    selectedVideo?: VideoPlayerContent | null
    selectedAudio?: VideoPlayerContent | null
    selectedSubtitles?: VideoPlayerContent | null
    onVideoAdded?(video: VideoPlayerContent): void
    onAudioAdded?(audio: VideoPlayerContent): void
    onSubtitlesAdded?(subtitles: VideoPlayerContent): void
    onVideoChange?(video: VideoPlayerContent | null): void
    onAudioChange?(audio: VideoPlayerContent | null): void
    onSubtitlesChange?(subtitles: VideoPlayerContent | null): void
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
    videoTracks = [],
    audioTracks = [],
    subtitleTracks = [],
    selectedVideo,
    selectedAudio,
    selectedSubtitles,
    onVideoAdded,
    onAudioAdded,
    onSubtitlesAdded,
    onVideoChange,
    onAudioChange,
    onSubtitlesChange,
}) => {
    const video = useRef<HTMLVideoElement>(null);
    const audio = useRef<HTMLAudioElement>(null);

    const [isPlaying, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [time, setTime] = useState<{ current: number, total: number }>();

    const [isFiddlingWithUi, setFiddlingWithUi] = useState(false);

    const state = useRefMemo(() => {
        let nextPlayIsFromCode = false;
        let nextPauseIsFromCode = false;
        let userWantsToPlay = false;

        let currentVideoSource: VideoPlayerContent | null = null;
        let currentAudioSource: VideoPlayerContent | null = null;
        let currentSubtitlesSource: VideoPlayerContent | null = null;

        const updatePlayState = () => {
            setPlaying(userWantsToPlay);
        };

        const updateTime = () => {
            setTime({
                current: video.current!.currentTime || 0,
                total: video.current!.duration || 0,
            });
        };

        const videoPlay = () => {
            if (video.current!.paused) {
                nextPlayIsFromCode = true;
                video.current!.play();
            }
        };

        const videoPause = () => {
            if (!video.current!.paused) {
                nextPauseIsFromCode = true;
                video.current!.pause();
            }
        };

        return {
            videoPlayHandler() {
                if (nextPlayIsFromCode) {
                    nextPlayIsFromCode = false;
                }
                else if (!userWantsToPlay) {
                    //console.log('user wants to play...');
                    userWantsToPlay = true;
                    audio.current!.play();
                    updatePlayState();
                }

                if (audio.current!.seeking)
                    videoPause();
            },
            videoPauseHandler() {
                if (nextPauseIsFromCode) {
                    nextPauseIsFromCode = false;
                }
                else if (!video.current!.seeking && userWantsToPlay) {
                    //console.log('user wants to pause...');
                    userWantsToPlay = false;
                    audio.current!.pause();
                    updatePlayState();
                }
            },
            videoSeekingHandler() {
                audio.current!.currentTime = video.current!.currentTime;
            },

            // when video starts seeking, pause it until audio seeking is complete
            videoSeekedHandler() {
                if (!video.current!.paused && audio.current!.seeking) {
                    videoPause();
                }

                if (userWantsToPlay && !audio.current!.seeking) {
                    videoPlay();
                    audio.current!.play();
                }
            },
            audioSeekedHandler() {
                if (!audio.current!.paused && video.current!.seeking) {
                    audio.current!.pause();
                }

                if (userWantsToPlay && !video.current!.seeking) {
                    videoPlay();
                    audio.current!.play();
                }
            },

            videoRateChangeHandler() {
                audio.current!.playbackRate = video.current!.playbackRate;
            },

            sourceChangeHandler(selectedVideo: VideoPlayerContent | null, selectedAudio: VideoPlayerContent | null, selectedSubtitles: VideoPlayerContent | null) {
                const reloadVideo = currentVideoSource !== selectedVideo;
                const reloadAudio = currentAudioSource !== selectedAudio;
                const reloadSubtitles = selectedSubtitles !== currentSubtitlesSource;

                currentVideoSource = selectedVideo;
                currentAudioSource = selectedAudio;
                currentSubtitlesSource = selectedSubtitles;

                const currentTime = video.current!.currentTime;

                if (reloadVideo)
                    video.current!.load();

                if (reloadAudio)
                    audio.current!.load();

                if (reloadSubtitles) {
                    for (const track of video.current!.textTracks) {
                        if (track.label === selectedSubtitles?.name)
                            track.mode = 'showing';
                        else if (track.mode === 'showing')
                            track.mode = 'hidden';
                    }
                }

                if (reloadAudio || reloadVideo)
                    this.seek(currentTime);
            },

            updateTime,
            play() {
                video.current!.play();
            },
            pause() {
                video.current!.pause();
            },
            seek(time: number) {
                video.current!.currentTime = time;
                updateTime();
            },
            setVolume(vol: number) {
                if (video.current && !video.current.muted) {
                    video.current.volume = vol;
                }

                if (audio.current) {
                    audio.current.volume = vol;
                }

                setVolume(vol);
            },
        };
    });

    const container = useRef<HTMLDivElement>(null);
    const containerClickHandler = useCallback<MouseEventHandler>(e => {
        if (container.current != e.target)
            return; // target must be the container, not one of its children

        if (isPlaying)
            state.pause();
        else
            state.play();
    }, [isPlaying]);

    const [forceControlsVisible, summonControls] = useState(true);
    const { set: dismissControls } = useTimer(() => {
        summonControls(false);
    }, []);

    const mouseMoveHandler = useCallback(() => {
        summonControls(true);
        dismissControls(2000); // dismiss after 2 seconds
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!container.current)
            return;

        if (document.fullscreenElement)
            document.exitFullscreen();
        else
            container.current.requestFullscreen();
    }, []);

    useEffect(() => {
        state.sourceChangeHandler(selectedVideo ?? null, selectedAudio ?? null, selectedSubtitles ?? null);
    }, [selectedVideo, selectedAudio, selectedSubtitles]);

    const showInterface = forceControlsVisible || isFiddlingWithUi || !isPlaying;

    return <div
        ref={container}
        className={classes['container'] + (showInterface ? '' : (' ' + classes['container-no-cursor']))}
        onClick={containerClickHandler}
        onMouseMove={mouseMoveHandler}
    >
        <video
            ref={video}
            //controls
            muted={selectedAudio != null}
            preload='metadata'
            playsInline
            className={classes['video']}
            onPlay={state.videoPlayHandler}
            onPause={state.videoPauseHandler}
            onSeeking={state.videoSeekingHandler}
            onSeeked={state.videoSeekedHandler}
            onRateChange={state.videoRateChangeHandler}
            onDurationChange={state.updateTime}
            onTimeUpdate={state.updateTime}
        >
            {selectedVideo != null && <source src={selectedVideo.url} type={selectedVideo.type} />}
            {subtitleTracks?.map(sub => <track key={sub.url} src={sub.url} kind="subtitles" label={sub.name} default={sub === selectedSubtitles} />)}
        </video>

        <audio
            ref={audio}
            className={classes['audio']}
            onSeeked={state.audioSeekedHandler}
        >
            {selectedAudio && <source src={selectedAudio.url} type={selectedAudio.type} />}
        </audio>

        <VideoControls
            show={showInterface}
            videoTracks={videoTracks}
            audioTracks={audioTracks}
            subtitleTracks={subtitleTracks}
            selectedVideo={selectedVideo}
            selectedAudio={selectedAudio}
            selectedSubtitles={selectedSubtitles}
            isPlaying={isPlaying}
            currentTime={time?.current ?? 0}
            totalTime={time?.total ?? 0}
            volume={volume}
            onChangeInteracting={setFiddlingWithUi}
            onPlay={state.play}
            onPause={state.pause}
            onSeek={state.seek}
            onVolumeChange={state.setVolume}
            onFullscreenChange={toggleFullscreen}
            onVideoChange={onVideoChange}
            onAudioChange={onAudioChange}
            onSubtitlesChange={onSubtitlesChange}
            onVideoAdded={onVideoAdded}
            onAudioAdded={onAudioAdded}
            onSubtitlesAdded={onSubtitlesAdded}
        />

        {(onVideoAdded || onAudioAdded || onSubtitlesAdded) && (
            <VideoDrop
                onVideoAdded={onVideoAdded}
                onAudioAdded={onAudioAdded}
                onSubtitlesAdded={onSubtitlesAdded}
            />
        )}
    </div>;
};
