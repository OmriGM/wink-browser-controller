import React, { useEffect, useRef, useState } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import { calculateEyeAspectRatio } from '../../utils/math'
import rightWinkEmoji from './../../assets/right_wink_emoji.png'
import leftWinkEmoji from './../../assets/left_wink_emoji.png'
import './WinkBoxController.scss'
import Loader from "../Loader/Loader";

const EYE_ASPECT_RATIO_TH = 0.22;
const EYE_AR_CONSECUTIVE_FRAMES = 8;
const VIDEO_HEIGHT = 30;
const VIDEO_WIDTH = 30;


const winkSide = Object.freeze({
    right: 'right',
    left: 'left',
});

const winkBoxMode = Object.freeze({
    visible: 'visible',
    cartoon: 'cartoon',
    hidden: 'hidden',
});


const WinkBoxController = ({ onLeftWinkAction, onRightWinkAction }) => {
    const [privateMode, setPrivateMode] = useState(true);
    const [latestWinkSide, setLatestWinkSide] = useState(null);
    const [detector, setDetector] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const winkCounterRef = useRef(0);

    useEffect(async () => {
        await loadDetector();
        await setupCamera();
        return (() => {
            streamRef.current.stop()
        })
    }, []);

    const loadDetector = async () => {
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
            runtime: 'tfjs', // or 'tfjs'
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        };
        const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        console.log('detector', detector)
        setDetector(detector);
    };

    const setupCamera = async () => {
        if (!navigator.mediaDevices) {
            alert('User media was not found, please turn it on')
        }
        const videoConfig = {
            video: {
                facingMode: 'user',
                width: VIDEO_WIDTH,
                height: VIDEO_HEIGHT,
                frameRate: {
                    ideal: 30,
                },
            },
        }

        streamRef.current = await navigator.mediaDevices.getUserMedia(videoConfig);

        if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current
        }
    };

    const isVoluntaryWink = winkSide => {
        if (winkCounterRef.current < EYE_AR_CONSECUTIVE_FRAMES && winkSide === latestWinkSide) {
            winkCounterRef.current += 1;
            return false
        }

        winkCounterRef.current = 0;
        return true
    };

    const isDesiredWinkingEye = (primaryEyeRatio, secondaryEyeRatio) =>
        primaryEyeRatio <= EYE_ASPECT_RATIO_TH && secondaryEyeRatio > EYE_ASPECT_RATIO_TH;


    const landmarksIndexes = Object.freeze({
        rightEyeEdgeL: 33,
        rightEyeEdgeR: 133,
        rightEyeUpperL: 160,
        rightEyeUpperR: 158,
        rightEyeLowerL: 144,
        rightEyeLowerR: 153,
        leftEyeEdgeL: 362,
        leftEyeEdgeR: 263,
        leftEyeUpperL: 385,
        leftEyeUpperR: 387,
        leftEyeLowerL: 380,
        leftEyeLowerR: 373,
    });

    const processEyesLandmarks = (keypoints) => {
        const leftEyeAspectRatio = calculateEyeAspectRatio({
            edgeR: keypoints[landmarksIndexes.leftEyeEdgeR],
            edgeL: keypoints[landmarksIndexes.leftEyeEdgeL],
            upperR: keypoints[landmarksIndexes.leftEyeUpperR],
            upperL: keypoints[landmarksIndexes.leftEyeUpperL],
            lowerR: keypoints[landmarksIndexes.leftEyeLowerR],
            lowerL: keypoints[landmarksIndexes.leftEyeLowerL],
        });
        const rightEyeAspectRatio = calculateEyeAspectRatio({
            edgeR: keypoints[landmarksIndexes.rightEyeEdgeR],
            edgeL: keypoints[landmarksIndexes.rightEyeEdgeL],
            upperR: keypoints[landmarksIndexes.rightEyeUpperR],
            upperL: keypoints[landmarksIndexes.rightEyeUpperL],
            lowerR: keypoints[landmarksIndexes.rightEyeLowerR],
            lowerL: keypoints[landmarksIndexes.rightEyeLowerL],
        });

        const isLeftEyeWink = isDesiredWinkingEye(leftEyeAspectRatio, rightEyeAspectRatio);
        const isRightEyeWink = isDesiredWinkingEye(rightEyeAspectRatio, leftEyeAspectRatio);

        if (isLeftEyeWink && isVoluntaryWink(winkSide.left)) {
            onLeftWinkAction();
            setLatestWinkSide(winkSide.left)
        }

        if (isRightEyeWink && isVoluntaryWink(winkSide.right)) {
            onRightWinkAction();
            setLatestWinkSide(winkSide.right)
        }
    };

    const detectWinks = async () => {
        const predictions = videoRef.current && await detector.estimateFaces(videoRef.current);
        // console.log('model', model);
        // console.log('videoRef.current', videoRef.current);
        if (predictions && predictions.length) {
            console.log(predictions);
            setIsLoading(false);
            predictions.forEach(({ keypoints }) => {
                processEyesLandmarks(keypoints)
            })
        }
        requestAnimationFrame(detectWinks)
    };


    const renderWinkEmoji = () => (
        <img
            src={latestWinkSide === winkSide.right ? rightWinkEmoji : leftWinkEmoji}
            alt={'wink_emoji'}
            className={'wink-emoji'}
        />
    );

    const renderVideo = () => (
        <video
            style={{ 'visibility': privateMode ? 'hidden' : 'hidden'}}
            ref={videoRef}
            id={'wink-box-controller'}
            autoPlay
            muted
            width={10}
            height={10}
            onLoadedData={detectWinks}
        />
    );

    return (
        <div className={'wink-box-controller'}>
            {/*<div className={'media-switch-container'}>*/}
                {/*<Switch className={'media-switch'} onChange={() => setPrivateMode(!privateMode)}/>*/}
            {/*</div>*/}
            <div className={'media-container'}>
                {/*{privateMode && renderWinkEmoji()}*/}
                {isLoading ? <Loader/> : renderWinkEmoji()}
                {renderVideo()}
            </div>
        </div>
    );
};

export default WinkBoxController;
