import React, { useEffect, useRef, useState } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

import { calculateEyeAspectRatio } from '../../utils/math'

import rightWinkEmoji from './../../assets/right_wink_emoji.png'
import leftWinkEmoji from './../../assets/left_wink_emoji.png'
import './WinkBoxController.scss'

const EYE_ASPECT_RATIO_TH = 0.22
const EYE_AR_CONSECUTIVE_FRAMES = 5

const VIDEO_HEIGHT = 250
const VIDEO_WIDTH = 250

const winkSide = Object.freeze({
    right: 'right',
    left: 'left',
})

const winkBoxMode = Object.freeze({
    visible: 'visible',
    cartoon: 'cartoon',
    hidden: 'hidden',
})


const WinkBoxController = ({ onLeftWinkAction, onRightWinkAction }) => {
    const [privateMode, setPrivateMode] = useState(''); // Add more modes like camera, emoji, or nothing
    const [latestWinkSide, setLatestWinkSide] = useState(null);
    const [model, setModel] = useState(null);
    const videoRef = useRef(null)
    const streamRef = useRef(null)
    const winkCounterRef = useRef(0);

    useEffect(async () => {
        await loadModel();
        await setupCamera();
        return (() => {
            streamRef.current.stop()
        })
    }, []);

    const loadModel = async () => {
        const model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh)
        setModel(model);
    }

    const setupCamera = async () => {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: {
                width: VIDEO_WIDTH,
                height: VIDEO_HEIGHT
            }
        })
        if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current
        }
    }

    const processEyesLandmarks = (leftEyeUpper0, leftEyeLower0, rightEyeUpper0, rightEyeLower0) => {
        const leftEyeAspectRatio = calculateEyeAspectRatio({ lower: leftEyeLower0, upper: leftEyeUpper0 })
        const rightEyeAspectRatio = calculateEyeAspectRatio({ lower: rightEyeLower0, upper: rightEyeUpper0 })
        // console.log(leftEyeAspectRatio, 'leftEyeAspectRatio');
        // console.log(rightEyeAspectRatio, 'rightEyeAspectRatio');
        const isLeftEyeWink = isDesiredWinkingEye(leftEyeAspectRatio, rightEyeAspectRatio)
        const isRightEyeWink = isDesiredWinkingEye(rightEyeAspectRatio, leftEyeAspectRatio)

        if (isLeftEyeWink && isVoluntaryWink(winkSide.left)) {
            onLeftWinkAction()
            setLatestWinkSide(winkSide.left)
        }
        if (isRightEyeWink && isVoluntaryWink(winkSide.right)) {
            onRightWinkAction()
            setLatestWinkSide(winkSide.right)
        }
    }

    const isVoluntaryWink = winkSide => {
        if (winkCounterRef.current < EYE_AR_CONSECUTIVE_FRAMES && winkSide === latestWinkSide) {
            winkCounterRef.current += 1
            return false
        }
        winkCounterRef.current = 0
        return true
    }

    const isDesiredWinkingEye = (primaryEyeRatio, secondaryEyeRatio) =>
        primaryEyeRatio <= EYE_ASPECT_RATIO_TH && secondaryEyeRatio > EYE_ASPECT_RATIO_TH

    const detectWinks = async () => {
        const predictions = model && videoRef.current && await model.estimateFaces({ input: videoRef.current });
        if (predictions && predictions.length) {
            predictions.forEach(({ annotations }) => {
                const { leftEyeUpper0, leftEyeLower0, rightEyeUpper0, rightEyeLower0 } = annotations
                processEyesLandmarks(leftEyeUpper0, leftEyeLower0, rightEyeUpper0, rightEyeLower0)
            })
        }
        requestAnimationFrame(detectWinks)
    }


    return (
        <div className={'stream-video'}>
            <div>
                <button onClick={() => setPrivateMode(winkBoxMode.hidden)}>No Show</button>
                <button onClick={() => setPrivateMode(winkBoxMode.cartoon)}>Anonymous</button>
                <button onClick={() => setPrivateMode(winkBoxMode.visible)}>I'm OK with it</button>
                {
                    privateMode === winkBoxMode.cartoon && (
                        <img
                            src={latestWinkSide === winkSide.right ? rightWinkEmoji : leftWinkEmoji}
                            alt={'wink_emoji'}
                            className={'wink-emoji'}
                        />
                    )
                }
            </div>
            <video
                style={{ 'visibility': privateMode === winkBoxMode.visible ? 'visible' : 'hidden' }}
                ref={videoRef}
                id={'stream-video'}
                playsinline
                autoPlay
                muted
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                onLoadedData={detectWinks}
            />
        </div>
    );
};

export default WinkBoxController;
