import React, { useEffect, useRef, useState } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-core';
import { calculateEyeAspectRatio } from '../../utils/math'
import rightWinkEmoji from './../../assets/right_wink_emoji.png'
import leftWinkEmoji from './../../assets/left_wink_emoji.png'
import './WinkBoxController.scss'
import Loader from "../Loader/Loader";

const EYE_ASPECT_RATIO_TH = 0.24;
const EYE_AR_CONSECUTIVE_FRAMES = 3;
const VIDEO_HEIGHT = 0;
const VIDEO_WIDTH = 0;
const FPS = 30


const winkSide = Object.freeze({
    right: 'right',
    left: 'left',
});

const landmarksIndexes = Object.freeze({
    left: {
        edgeL: 362,
        edgeR: 263,
        upperL: 385,
        upperR: 386,
        lowerL: 380,
        lowerR: 374
    },
    right: {
        edgeL: 33,
        edgeR: 133,
        upperL: 159,
        upperR: 158,
        lowerL: 145,
        lowerR: 153,
    }
});

const WinkBoxController = ({ onLeftWinkAction, onRightWinkAction }) => {
    const [latestWinkSide, setLatestWinkSide] = useState(null);
    const [detector, setDetector] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const winkCounterRef = useRef(0);

    // Set up camera
    useEffect(() => {
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
                        ideal: FPS,
                        max: FPS,
                    },
                },
            }

            streamRef.current = await navigator.mediaDevices.getUserMedia(videoConfig);

            if (videoRef.current) {
                videoRef.current.srcObject = streamRef.current
            }
        };
        setupCamera();
        return (() => {
            streamRef.current.stop()
        })
    }, [])

    // Load face landmarks detector
    useEffect(() => {
        const loadDetector = async () => {
            const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
            const detectorConfig = {
                runtime: 'mediapipe',
                refineLandmarks: true,
                solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
            };
            const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
            console.log('detector', detector)
            setDetector(detector);
        };
        loadDetector();
    }, []);

    // Make sure it's not a random blink
    const isVoluntaryWink = winkSide => {
        if (winkCounterRef.current < EYE_AR_CONSECUTIVE_FRAMES && winkSide === latestWinkSide) {
            winkCounterRef.current += 1;
            return false
        }

        winkCounterRef.current = 0;
        return true
    };

    // Make sure only one eye is winking
    const isDesiredWinkingEye = ({ primaryEAR, secondaryEAR }) =>
        primaryEAR <= EYE_ASPECT_RATIO_TH && secondaryEAR > EYE_ASPECT_RATIO_TH;


    const processEyesLandmarks = (keypoints) => {
        const leftEyeAspectRatio = calculateEyeAspectRatio({
            edgeL: keypoints[landmarksIndexes.left.edgeL],
            edgeR: keypoints[landmarksIndexes.left.edgeR],
            upperL: keypoints[landmarksIndexes.left.upperL],
            upperR: keypoints[landmarksIndexes.left.upperR],
            lowerL: keypoints[landmarksIndexes.left.lowerL],
            lowerR: keypoints[landmarksIndexes.left.lowerR],
        });
        const rightEyeAspectRatio = calculateEyeAspectRatio({
            edgeL: keypoints[landmarksIndexes.right.edgeL],
            edgeR: keypoints[landmarksIndexes.right.edgeR],
            upperL: keypoints[landmarksIndexes.right.upperL],
            upperR: keypoints[landmarksIndexes.right.upperR],
            lowerL: keypoints[landmarksIndexes.right.lowerL],
            lowerR: keypoints[landmarksIndexes.right.lowerR],
        });
        // console.log('right:', rightEyeAspectRatio);
        // console.log('left:', leftEyeAspectRatio);

        const isLeftEyeWink = isDesiredWinkingEye({
            primaryEAR: leftEyeAspectRatio,
            secondaryEAR: rightEyeAspectRatio
        });
        const isRightEyeWink = isDesiredWinkingEye({
            primaryEAR: rightEyeAspectRatio,
            secondaryEAR: leftEyeAspectRatio
        });

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
        setIsLoading(false);
        // console.log(predictions);
        if (predictions && predictions.length) {
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
            ref={videoRef}
            id={'wink-box-controller'}
            autoPlay
            muted
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            onLoadedData={() => requestAnimationFrame(detectWinks)}
        />
    );

    return (
        <div className={'wink-box-controller'}>
            <div className={'media-container'}>
                {isLoading ? <Loader/> : renderWinkEmoji()}
                {renderVideo()}
            </div>
        </div>
    );
};

export default WinkBoxController;
