import { FC, MouseEventHandler, useCallback, useRef, useState } from 'react';
import { useRefMemo, useTimer } from '../../utility';
import { VideoControls } from '../video-controls';
import classes from './style.module.css';

const EMPTY_ARRAY: never[] = [];

export interface Content {
    url: string
    name: string
    type: string
}

export interface VideoPlayerProps {
    videoTracks?: Content[]
    audioTracks?: Content[]
    subtitleTracks?: Content[]
    selectedVideo?: Content | null
    selectedAudio?: Content | null
    selectedSubtitles?: Content | null
    onVideoChange?(video: Content | null): void
    onAudioChange?(audio: Content | null): void
    onSubtitlesChange?(subtitles: Content | null): void
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
    videoTracks = EMPTY_ARRAY,
    audioTracks = EMPTY_ARRAY,
    subtitleTracks = EMPTY_ARRAY,
    selectedVideo,
    selectedAudio,
    selectedSubtitles,
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
            isPlaying={isPlaying}
            currentTime={time?.current ?? 0}
            totalTime={time?.total ?? 0}
            volume={volume}
            onChangeInteracting={setFiddlingWithUi}
            onPlay={state.play}
            onPause={state.pause}
            onSeek={state.seek}
            onVolumeChange={state.setVolume}
        />
    </div>;
};
