import React, { useEffect, useRef, useState } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import { Switch } from 'antd';
import { calculateEyeAspectRatio } from '../../utils/math'
import rightWinkEmoji from './../../assets/right_wink_emoji.png'
import leftWinkEmoji from './../../assets/left_wink_emoji.png'
import './WinkBoxController.scss'

const EYE_ASPECT_RATIO_TH = 0.24
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
    const [privateMode, setPrivateMode] = useState(true);
    const [latestWinkSide, setLatestWinkSide] = useState(null);
    const [model, setModel] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
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
        if (!navigator.mediaDevices) {
            alert('User media was not found, please turn it on')
        }
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

    const processEyesLandmarks = ({ leftEyeUpper0, leftEyeLower0, rightEyeUpper0, rightEyeLower0 }) => {
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

    const detectWinks = async () => {
        const predictions = model && videoRef.current && await model.estimateFaces({ input: videoRef.current });
        if (predictions && predictions.length) {
            predictions.forEach(({ annotations }) => {
                processEyesLandmarks(annotations)
            })
        }
        requestAnimationFrame(detectWinks)
    }


    const renderWinkEmoji = () => (
        <img
            src={latestWinkSide === winkSide.right ? rightWinkEmoji : leftWinkEmoji}
            alt={'wink_emoji'}
            className={'wink-emoji'}
        />
    )

    const renderVideo = () => (
        <video
            style={{ 'visibility': privateMode === winkBoxMode.visible ? 'visible' : 'hidden' }}
            ref={videoRef}
            id={'wink-box-controller'}
            autoPlay
            muted
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            onLoadedData={detectWinks}
        />
    )

    return (
        <div className={'wink-box-controller'}>
            <div className={'media-switch-container'}>
                <Switch className={'media-switch'} onChange={() => setPrivateMode(!privateMode)}/>
            </div>
            <div className={'media-container'}>
                {privateMode ? renderWinkEmoji() : renderVideo()}
            </div>
        </div>
    );
};

export default WinkBoxController;
