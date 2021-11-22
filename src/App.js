import { useState, useEffect, useRef } from 'react'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import './App.css';

const EYE_ASPECT_RATIO_TH = 0.35
const EYE_AR_CONSECUTIVE_FRAMES = 4
const DEFAULT_SCROLL_BY_PIXELS = 55
const VIDEO_HEIGHT = 250
const VIDEO_WIDTH = 250

const App = () => {
    const [model, setModel] = useState(null);
    // TODO: Add input component for changing this value
    const [scrollBy, setScrollBy] = useState(DEFAULT_SCROLL_BY_PIXELS);
    const videoRef = useRef(null)
    const streamRef = useRef(null)
    const winkCounterRef = useRef(0);
    const currentYScrollPosition = useRef(0)

    useEffect(async () => {
        listenToWindowScroll();
        await setupCamera();
        await loadModel();
        return (() => {
            streamRef.current.stop()
            window.removeEventListener('scroll', () => currentYScrollPosition.current = window.scrollY)
        })
    }, []);

    // TODO: Export to utils and describe the function
    const calculateEyeAspectRatio = (lowerEye, upperEye) => {
        const a = calculateDistance(upperEye[4], lowerEye[3]);
        const b = calculateDistance(upperEye[5], lowerEye[4]);
        const c = calculateDistance(upperEye[0], upperEye[upperEye.length - 1]);

        return (a + b) / (2.0 * c);
    }

    // TODO: Export to utils and describe the function
    const calculateDistance = (point1, point2) => Math.hypot(point2[0] - point1[0], point2[1] - point1[1])

    const listenToWindowScroll = () => {
        window.addEventListener('scroll', () => currentYScrollPosition.current = window.scrollY)
    }

    const loadModel = async () => {
        const faceModel = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh)
        setModel(faceModel);
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

    const isDesiredWinkingEye = (primaryEyeRatio, secondaryEyeRatio) =>
        primaryEyeRatio <= EYE_ASPECT_RATIO_TH && secondaryEyeRatio > EYE_ASPECT_RATIO_TH

    const scrollOnWinkAction = pixelsToScroll => {
        window.scroll({
            top: currentYScrollPosition.current + pixelsToScroll,
            behavior: 'smooth'
        });
    }

    const isVoluntaryWink = () => {
        if (winkCounterRef.current < EYE_AR_CONSECUTIVE_FRAMES) {
            winkCounterRef.current += 1
            return false
        }
        winkCounterRef.current = 0
        return true
    }

    const handleWink = onWinkAction => {
        isVoluntaryWink() && onWinkAction()
    }

    const processEyesLandmarks = (leftEyeUpper0, leftEyeLower0, rightEyeUpper0, rightEyeLower0) => {
        const leftEyeAspectRatio = calculateEyeAspectRatio(leftEyeLower0, leftEyeUpper0)
        const rightEyeAspectRatio = calculateEyeAspectRatio(rightEyeLower0, rightEyeUpper0)

        const isLeftEyeWink = isDesiredWinkingEye(leftEyeAspectRatio, rightEyeAspectRatio)
        const isRightEyeWink = isDesiredWinkingEye(rightEyeAspectRatio, leftEyeAspectRatio)

        isLeftEyeWink && handleWink(() => scrollOnWinkAction(-scrollBy))
        isRightEyeWink && handleWink(() => scrollOnWinkAction(scrollBy))
    }

    const detectWinks = async () => {
        const predictions = model && videoRef.current && await model.estimateFaces({
            input: videoRef.current,
            predictIrises: false
        });

        predictions.forEach(({ annotations }) => {
            const { leftEyeUpper0, leftEyeLower0, rightEyeUpper0, rightEyeLower0 } = annotations
            processEyesLandmarks(leftEyeUpper0, leftEyeLower0, rightEyeUpper0, rightEyeLower0)
        })

        requestAnimationFrame(detectWinks)
    }

    return (
        <div className="App">
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras auctor sodales tempus. Sed ante
                libero, scelerisque a pulvinar non, mattis eu nibh. Donec bibendum euismod lorem quis laoreet.
                Aenean elit leo, pretium vel condimentum quis, porta vel lorem. Suspendisse cursus ante sed
                purus
                hendrerit, in porta mauris vehicula. Duis quis egestas ipsum, quis porta neque. Curabitur
                vulputate
                felis ac ex iaculis facilisis. Fusce euismod, velit ut interdum vehicula, massa ligula vehicula
                mi,
                in ultricies ex nulla sit amet tellus. Suspendisse porttitor tellus velit, id vestibulum dolor
                pharetra at. Nullam tempor mi aliquam neque rhoncus feugiat. Suspendisse id cursus velit, ac
                cursus
                urna. Donec ut placerat lectus. Fusce sit amet malesuada turpis, et posuere est. In ut congue
                tortor, id aliquet sapien.
            </p>
            <p>

                Suspendisse dolor ante, finibus at euismod quis, porttitor et nulla. In erat eros, tempus a
                facilisis sed, faucibus consequat est. Mauris venenatis enim ut ante molestie, feugiat convallis
                libero eleifend. Praesent sodales, ligula tempus fringilla iaculis, elit ex posuere lorem, ut
                lacinia turpis ex et orci. Proin varius mauris quam, sit amet rutrum ante dictum sed. Sed non
                metus
                sed dolor suscipit tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac
                gravida sem. Suspendisse potenti.
            </p>
            <p>

                Sed sit amet nisl sit amet lectus interdum iaculis. Proin at dolor id lacus rutrum suscipit.
                Integer
                vehicula urna at enim viverra fermentum. Pellentesque nec consectetur ipsum, eget accumsan est.
                Donec turpis risus, posuere in euismod sed, maximus a felis. Nam aliquet sit amet tellus vitae
                suscipit. Nullam varius massa id ex sagittis, eget pellentesque neque rhoncus. Nunc a mollis
                erat,
                sit amet tincidunt dui. Pellentesque tincidunt lorem ac justo aliquet faucibus. In hendrerit
                ornare
                mauris, in vulputate ipsum.

            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
            <video
                ref={videoRef}
                id={'stream-video'}
                playsInline
                autoPlay
                muted
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                className={'stream-video'}
                onLoadedData={detectWinks}
            />
        </div>
    );
}

export default App;
